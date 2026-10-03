// ===================================================================
// Pipeline Jenkins CI/CD cho d? án Devops-26-03
// ===================================================================

pipeline {
  agent any

  environment {
    REGISTRY   = 'ghcr.io'
    // Tên GitHub c?a b?n (B?T BU?C vi?t thý?ng)
    GITHUB_USER = 'nhan-trinh'
    
    // Khai báo credential (ð? t?o ? d? án trý?c v?i ID ghcr-credentials)
    GHCR_CREDS = credentials('ghcr-credentials')

    PLATFORMS = 'linux/amd64,linux/arm64'
    DEPLOY_PROJECT = 'devops-26-03'
  }

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }

  stages {
    stage('Chu?n b?') {
      steps {
        script {
          env.SHA_SHORT  = sh(script: 'git rev-parse --short=7 HEAD', returnStdout: true).trim()
          
          // Image tags
          env.FRONTEND_IMAGE = "${REGISTRY}/${GITHUB_USER}/scm-frontend:${env.SHA_SHORT}"
          env.FRONTEND_LATEST = "${REGISTRY}/${GITHUB_USER}/scm-frontend:latest"
          
          env.BACKEND_IMAGE = "${REGISTRY}/${GITHUB_USER}/scm-backend:${env.SHA_SHORT}"
          env.BACKEND_LATEST = "${REGISTRY}/${GITHUB_USER}/scm-backend:latest"
        }

        echo "S? push lên GHCR v?i tài kho?n: ${GITHUB_USER}"

        sh '''
          echo "$GHCR_CREDS_PSW" | docker login ${REGISTRY} -u "$GHCR_CREDS_USR" --password-stdin
          docker run --privileged --rm tonistiigi/binfmt --install all || true
          docker buildx create --name multiarch --driver docker-container --use 2>/dev/null || docker buildx use multiarch
          docker buildx inspect --bootstrap
        '''
      }
    }

    stage('1. BUILD & PUSH') {
      parallel {
        stage('Frontend') {
          steps {
            echo "=== Build & Push Frontend ==="
            sh """
              docker buildx build \\
                --platform ${PLATFORMS} \\
                --tag ${env.FRONTEND_IMAGE} \\
                --tag ${env.FRONTEND_LATEST} \\
                --push \\
                ./client
            """
          }
        }
        stage('Backend') {
          steps {
            echo "=== Build & Push Backend ==="
            sh """
              docker buildx build \\
                --platform ${PLATFORMS} \\
                --tag ${env.BACKEND_IMAGE} \\
                --tag ${env.BACKEND_LATEST} \\
                --push \\
                ./server
            """
          }
        }
      }
    }

    stage('2. PULL') {
      steps {
        echo "=== Kéo image t? registry v? máy ==="
        sh """
          docker rmi ${env.FRONTEND_IMAGE} ${env.BACKEND_IMAGE} 2>/dev/null || true
          docker pull ${env.FRONTEND_IMAGE}
          docker pull ${env.BACKEND_IMAGE}
        """
      }
    }

    stage('3. DEPLOY') {
      steps {
        echo "=== Deploy ?ng d?ng ==="
        withEnv([
          "FRONTEND_IMAGE_TAG=${env.FRONTEND_IMAGE}",
          "BACKEND_IMAGE_TAG=${env.BACKEND_IMAGE}"
        ]) {
          sh """
            mkdir -p ./server && cp ./server/.env.example ./server/.env 2>/dev/null || touch ./server/.env && docker compose -p ${DEPLOY_PROJECT} \\
              -f docker-compose.yml -f docker-compose.prod.yml \\
              up -d --remove-orphans
          """
        }
      }
    }
  }

  post {
    success {
      echo "THÀNH CÔNG! Ð? deploy ${DEPLOY_PROJECT}."
    }
    always {
      sh 'docker logout ${REGISTRY} || true'
      sh 'docker image prune -f --filter "until=168h" || true'
    }
  }
}



