import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';


export class CdkPizzaAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

//SQS
    const pendingOrdersQueue = new Queue(this, 'PendingOrdersQueue', {});
    const sendOrdersQueue = new Queue(this, 'sendOrdersQueue', {});

//DYNAMODB
    const ordersTable = new Table(this, 'OrdersTable',{
        partitionKey: { name: 'orderId', type: AttributeType.STRING },
        billingMode:BillingMode.PAY_PER_REQUEST, 
      })
    
      


//FUNCTIONS 
    const newOrderFunction = new Function(this, 'NewOrderFuncion', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler.newOrder',
      code: Code.fromAsset('lib/functions'),
      environment: {
        PENDING_ORDERS_QUEUE_URL: pendingOrdersQueue.queueUrl,
        ORDER_TABLE_NAME: ordersTable.tableName,
      }  
           
});
    pendingOrdersQueue.grantSendMessages(newOrderFunction);
    ordersTable.grantWriteData(newOrderFunction);



    const getOrderFunction = new Function(this, 'GetOrderFuncion', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler.getOrder',
      code: Code.fromAsset('lib/functions'),
      environment: {
        ORDER_TABLE_NAME: ordersTable.tableName,
      }
});

    ordersTable.grantReadData(getOrderFunction);

    

    const prepOrderFunction = new Function(this, 'PrepOrderFuncion', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler.prepOrder',
      code: Code.fromAsset('lib/functions'),  
      environment: {
        ORDERS_TABLE_NAME: ordersTable.tableName,
      }
});
    
    prepOrderFunction.addEventSource(new SqsEventSource(pendingOrdersQueue, {
      batchSize: 1
    }));
    
    ordersTable.grantWriteData(prepOrderFunction);
  


    const sendOrderFunction = new Function(this, 'SendOrderFuncion', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler.sendOrder',
      code: Code.fromAsset('lib/functions'),
      environment: {
        SEND_ORDERS_QUEUE_URL: sendOrdersQueue.queueUrl,
      }
});
      
    sendOrdersQueue.grantSendMessages(sendOrderFunction);


//API GATEWAY
    const api = new apigateway.RestApi(this, 'PizzeriaApi', {
      restApiName: 'Pizzeria CDK Service',
      });

    const orderResource = api.root.addResource('order');
    orderResource.addMethod('POST', new apigateway.LambdaIntegration(newOrderFunction));  
    orderResource.addResource('{orderId}').addMethod('GET', new apigateway.LambdaIntegration(getOrderFunction));
  

 


  }
}
