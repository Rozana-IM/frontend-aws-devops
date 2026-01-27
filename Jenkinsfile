pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        S3_BUCKET = 'frontend-aws-jenkins-rozana'
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
    }
}
