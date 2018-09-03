#!/usr/bin/env groovy

def execute(){
    def registry="eu.gcr.io/kyma-project"
    def application="varkes-openapi-mock"
    def dockerCredentials="gcr-rw"
    def isMaster = env.BRANCH_NAME == 'master'	
    def appVersion = env.TAG_NAME?env.TAG_NAME:"develop-${env.BRANCH_NAME}"	


    stage("setup"){
        withCredentials([usernamePassword(credentialsId: 'gcr-rw', passwordVariable: 'pwd', usernameVariable: 'uname')]) {
            sh "docker login -u $uname -p '$pwd' $registry"
        }
    }
    
    stage("build"){
        sh "cd OpenAPIMock && docker build -t $application ."
    }
    
    
    stage("push image"){
        sh "docker tag $application:latest $registry/$application:$appVersion"
        sh "docker push $registry/$application:$appVersion"
    }
}

return this