#!/usr/bin/env groovy
def label = "varkes-${UUID.randomUUID().toString()}"

properties([
    buildDiscarder(logRotator(numToKeepStr: '30')),
])

podTemplate(label: label) {
    node(label) {
        try {
            timestamps {
                timeout(time:20, unit:"MINUTES") {
                    ansiColor('xterm') {
                        stage("checkout") {
                            checkout scm
                        }

                        stage("build image") {
                            parallel(
                                "app-connector": {
                                    load('app-connector/Jenkinsfile.groovy').execute()
                                },
                                "openapi-mock": {
                                    load('openapi-mock/Jenkinsfile.groovy').execute()
                                },
                                "odata-mock": {
                                    load('odata-mock/Jenkinsfile.groovy').execute()
                                },
                                "commerce-mock": {
                                  //  load('commerce-mock/Jenkinsfile.groovy').execute() let's not build them for now until we fix the base repo.
                                },
                                "marketing-mock": {
                                  //  load('marketing-mock/Jenkinsfile.groovy').execute()
                                }
                            )
                        }
                    }
                }
            }
        } catch (ex) {
            echo "Got exception: ${ex}"
            currentBuild.result = "FAILURE"
            def body = "${currentBuild.currentResult} ${env.JOB_NAME}${env.BUILD_DISPLAY_NAME}: on branch: ${env.BRANCH_NAME}. See details: ${env.BUILD_URL}"
            emailext body: body, recipientProviders: [[$class: 'DevelopersRecipientProvider'], [$class: 'CulpritsRecipientProvider'], [$class: 'RequesterRecipientProvider']], subject: "${currentBuild.currentResult}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
        }

    }
}