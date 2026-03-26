pipeline {
  agent any

  environment {
    AWS_DEFAULT_REGION = 'us-east-1'
    S3_BUCKET = 'rozana-projects.online'

    FRONTEND_DIST_ID = 'E1QLTMO99TG8ZU'
    IMAGES_DIST_ID   = 'E1I10ME7AU8VDH'
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

    stage('Invalidate CloudFront (Frontend)') {
      steps {
        sh '''
          aws cloudfront create-invalidation \
            --distribution-id $FRONTEND_DIST_ID \
            --paths "/*"
        '''
      }
    }

    stage('Invalidate CloudFront (Images CDN)') {
      steps {
        sh '''
          aws cloudfront create-invalidation \
            --distribution-id $IMAGES_DIST_ID \
            --paths "/*"
        '''
      }
    }

  }
}
