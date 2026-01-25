pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        S3_BUCKET = 'aws-devops-microservices-frontend-1'
        CLOUDFRONT_DISTRIBUTION_ID = 'E1ETXJ3RKSJW87'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Indyalamounika/frontendproject.git'
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                  chmod +x build.sh
                  ./build.sh
                '''
            }
        }

        stage('Deploy to S3 & Invalidate CloudFront') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials'
                ]]) {
                    sh '''
                      aws s3 sync build/ s3://$S3_BUCKET --delete
                      aws cloudfront create-invalidation \
                        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
                        --paths "/*"
                    '''
                }
            }
        }
    }
}
