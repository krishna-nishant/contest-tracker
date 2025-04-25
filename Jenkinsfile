pipeline {
    agent any

    environment {
        IMAGE = "krishna0795/contest-tracker"
        TAG = "v${BUILD_NUMBER}"
        DOCKER_HUB_CREDS = credentials('dockerhub-creds')
        YOUTUBE_API_KEY = credentials('youtube-api-key')
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
                    sh 'npm install && npm test'
                }
                dir('backend') {
                    sh 'npm install && npm test'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t $IMAGE:$TAG ."
            }
        }

        stage('Push Docker Image') {
            steps {
                sh "echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin"
                sh "docker tag $IMAGE:$TAG $IMAGE:latest"
                sh "docker push $IMAGE:$TAG"
                sh "docker push $IMAGE:latest"
            }
        }

        stage('Deploy Locally') {
            steps {
                sh "docker stop contest-tracker || true"
                sh "docker rm contest-tracker || true"
                sh "docker run -d -p 3030:5000 -e PORT=5000 -e YOUTUBE_API_KEY=${YOUTUBE_API_KEY} --name contest-tracker $IMAGE:$TAG"
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