// ===================================================================
// Pipeline Jenkins CI/CD cho du an Devops-26-03
// ===================================================================

pipeline {
  agent any

  environment {
    REGISTRY   = 'ghcr.io'
    GITHUB_USER = 'nhan-trinh'
    GHCR_CREDS = credentials('ghcr-credentials')
    DEPLOY_PROJECT = 'devops-26-03'
  }

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }

  stages {
    stage('Chuan bi') {
      steps {
        script {
          env.SHA_SHORT = sh(script: 'git rev-parse --short=7 HEAD', returnStdout: true).trim()
          env.FRONTEND_IMAGE = "${REGISTRY}/${GITHUB_USER}/scm-frontend:${env.SHA_SHORT}"
          env.FRONTEND_LATEST = "${REGISTRY}/${GITHUB_USER}/scm-frontend:latest"
          env.BACKEND_IMAGE = "${REGISTRY}/${GITHUB_USER}/scm-backend:${env.SHA_SHORT}"
          env.BACKEND_LATEST = "${REGISTRY}/${GITHUB_USER}/scm-backend:latest"
        }
        echo "Se push len GHCR voi tai khoan: ${GITHUB_USER}"
        sh 'echo "$GHCR_CREDS_PSW" | docker login ${REGISTRY} -u "$GHCR_CREDS_USR" --password-stdin'
      }
    }

    stage('1. BUILD & PUSH') {
      parallel {
        stage('Frontend') {
          steps {
            echo "=== Build & Push Frontend ==="
            sh """
              docker build \
                --tag ${env.FRONTEND_IMAGE} \
                --tag ${env.FRONTEND_LATEST} \
                ./client
              docker push ${env.FRONTEND_IMAGE}
              docker push ${env.FRONTEND_LATEST}
            """
          }
        }
        stage('Backend') {
          steps {
            echo "=== Build & Push Backend ==="
            sh """
              docker build \
                --tag ${env.BACKEND_IMAGE} \
                --tag ${env.BACKEND_LATEST} \
                ./server
              docker push ${env.BACKEND_IMAGE}
              docker push ${env.BACKEND_LATEST}
            """
          }
        }
      }
    }

    stage('2. PULL') {
      steps {
        echo "=== Keo image tu registry ve may ==="
        sh """
          docker rmi ${env.FRONTEND_IMAGE} ${env.BACKEND_IMAGE} 2>/dev/null || true
          docker pull ${env.FRONTEND_IMAGE}
          docker pull ${env.BACKEND_IMAGE}
        """
      }
    }

    stage('3. DEPLOY') {
      steps {
        echo "=== Deploy ung dung ==="
        withEnv([
          "FRONTEND_IMAGE_TAG=${env.FRONTEND_IMAGE}",
          "BACKEND_IMAGE_TAG=${env.BACKEND_IMAGE}"
        ]) {
          sh """
            mkdir -p ./server
            if [ ! -f ./server/.env ]; then
              cp ./server/.env.example ./server/.env 2>/dev/null || touch ./server/.env
              sed -i "s/pk_test_your_clerk_publishable_key/pk_test_Zm9uZC1tdWxlLTIzLmNsZXJrLmFjY291bnRzLmRldiQ/g" ./server/.env
              sed -i "s|mongodb://localhost:27017|mongodb://mongodb:27017|g" ./server/.env
            fi
            docker compose -p ${DEPLOY_PROJECT} \
              -f docker-compose.yml -f docker-compose.prod.yml \
              up -d --remove-orphans
          """
        }
      }
    }
  }

  post {
    success {
      echo "THANH CONG! Da deploy ${DEPLOY_PROJECT}."
    }
    always {
      sh 'docker logout ${REGISTRY} || true'
      sh 'docker image prune -f --filter "until=168h" || true'
    }
  }
}