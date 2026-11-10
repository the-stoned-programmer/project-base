import * as path from 'path';
import * as fs from 'fs';
import {
  Stack,
  StackProps,
  RemovalPolicy,
  CfnOutput,
  Duration,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_apprunner as apprunner,
  aws_s3_deployment as s3deploy,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface ModernAppStackProps extends StackProps {
  environmentName?: string;
  imageUri?: string;
}

export class ModernAppStack extends Stack {
  public readonly distributionDomain: string;
  public readonly appRunnerServiceUrl: string;

  constructor(scope: Construct, id: string, props?: ModernAppStackProps) {
    super(scope, id, props);

    const envName = props?.environmentName || 'development';
    const imageUri = props?.imageUri || 'public.ecr.aws/aws-containers/hello-app-runner:latest';

    // 1. Private S3 Bucket for Static Web App (Zero Public Access)
    const webBucket = new s3.Bucket(this, 'WebBucket', {
      bucketName: undefined, // Let CDK auto-generate unique bucket name
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: envName === 'production' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: envName !== 'production',
    });

    // 2. AWS App Runner Service for Rust Backend API
    const apiService = new apprunner.CfnService(this, 'ApiService', {
      serviceName: `modern-backend-${envName}`,
      sourceConfiguration: {
        autoDeploymentsEnabled: false,
        imageRepository: {
          imageIdentifier: imageUri,
          imageRepositoryType: 'ECR_PUBLIC',
          imageConfiguration: {
            port: '3001',
            runtimeEnvironmentVariables: [
              { name: 'ENVIRONMENT', value: envName },
              { name: 'PORT', value: '3001' },
            ],
          },
        },
      },
      healthCheckConfiguration: {
        path: '/api/status',
        protocol: 'HTTP',
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
      instanceConfiguration: {
        cpu: '1 vCPU',
        memory: '2 GB',
      },
    });

    this.appRunnerServiceUrl = apiService.attrServiceUrl;

    // 3. Amazon CloudFront Distribution with Origin Access Control (OAC)
    // S3 Origin (Static Web Assets)
    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(webBucket);

    // API Origin (App Runner Service URL)
    const apiOrigin = new origins.HttpOrigin(apiService.attrServiceUrl, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
    });

    const distribution = new cloudfront.Distribution(this, 'AppDistribution', {
      comment: `Modern Project Base CDN (${envName})`,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        },
      ],
    });

    this.distributionDomain = distribution.distributionDomainName;

    // 4. Deploy Web Assets to S3 & Invalidate CloudFront Cache
    const webDistPath = path.resolve(__dirname, '../../../apps/web/dist');
    const webAssetSource =
      fs.existsSync(webDistPath) && fs.readdirSync(webDistPath).length > 0
        ? s3deploy.Source.asset(webDistPath)
        : s3deploy.Source.data(
            'index.html',
            '<!DOCTYPE html><html><body>Placeholder for Modern Web App</body></html>'
          );

    new s3deploy.BucketDeployment(this, 'DeployWebAssets', {
      sources: [webAssetSource],
      destinationBucket: webBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // 5. CloudFormation Outputs
    new CfnOutput(this, 'DistributionDomain', {
      value: distribution.distributionDomainName,
      description: 'Primary application domain (HTTPS, Zero-CORS)',
    });

    new CfnOutput(this, 'WebBucketName', {
      value: webBucket.bucketName,
      description: 'S3 bucket name for web asset deployment',
    });

    new CfnOutput(this, 'AppRunnerServiceUrl', {
      value: apiService.attrServiceUrl,
      description: 'Direct backend App Runner service URL',
    });
  }
}
