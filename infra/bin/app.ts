import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { ModernAppStack } from '../lib/stacks/app-stack';

const app = new App();

const account = process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID || '111111111111';
const region = process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';
const environmentName = process.env.ENVIRONMENT || 'development';

new ModernAppStack(app, `ModernAppStack-${environmentName}`, {
  env: {
    account,
    region,
  },
  environmentName,
  description: 'Modern Project Base full-stack cloud infrastructure (S3, CloudFront, App Runner)',
});

app.synth();
