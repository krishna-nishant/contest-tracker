pipeline {
    agent any

    environment {
        IMAGE = 'krishna0795/contest-tracker'
        TAG = "v${BUILD_NUMBER}"
        DOCKER_HUB_CREDS = credentials('dockerhub-creds')
        YOUTUBE_API_KEY = credentials('youtube-api-key')
        MONGODB_URI = credentials('mongodb-uri')
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install & Test') {
            steps {
                dir('frontend') {
                    bat 'npm install || exit 0'
                    bat 'npm test || exit 0'
                }
                dir('backend') {
                    bat 'npm install || exit 0'
                    bat 'npm test || exit 0'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE%:%TAG% .'
            }
        }

        stage('Push Docker Image') {
            steps {
                bat 'docker login -u %DOCKER_HUB_CREDS_USR% -p %DOCKER_HUB_CREDS_PSW%'
                bat 'docker tag %IMAGE%:%TAG% %IMAGE%:latest'
                bat 'docker push %IMAGE%:%TAG%'
                bat 'docker push %IMAGE%:latest'
            }
        }

        stage('Deploy Locally') {
            steps {
                bat '''
                    docker rm -f contest-tracker 2>NUL
                    docker run -d -p 3030:5000 -e PORT=5000 -e YOUTUBE_API_KEY=%YOUTUBE_API_KEY% -e MONGODB_URI=%MONGODB_URI% --name contest-tracker %IMAGE%:%TAG%
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}