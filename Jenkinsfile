pipeline {
  agent any

  environment {
    AWS_DEFAULT_REGION = 'us-east-1'
    S3_BUCKET = 'rozana-projects.online '
    CLOUDFRONT_DIST_ID = 'E1QLTMO99TG8ZU'
  }

  stages {

    stage('Build Frontend') {
      steps {
        sh '''
          chmod +x build.sh
          ./build.sh
        '''
      }
    }

    stage('Deploy to S3') {
      steps {
        sh '''
          aws s3 sync build/ s3://$S3_BUCKET --delete
        '''
      }
    }

    stage('Invalidate CloudFront Cache') {
      steps {
        sh '''
          aws cloudfront create-invalidation \
            --distribution-id $CLOUDFRONT_DIST_ID \
            --paths "/*"
        '''
      }
    }
  }
}
