pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'ci/jenkins-pipeline', url: 'https://github.com/14986cm/APC_2025-2026_T1_SISTEM_IskoLAR.git'
            }
        }

        stage('Build') {
            steps {
                echo "Building the project..."
                // Example: npm install
                // sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo "Running tests..."
                // Example: npm test
                // sh 'npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying application..."
                // Example: docker build + run
                // sh 'docker build -t myapp .'
                // sh 'docker run -d -p 3000:3000 myapp'
            }
        }
    }
}
