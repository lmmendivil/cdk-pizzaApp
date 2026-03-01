const { v4: uuidv4 } = require('uuid');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const sqsClient = new SQSClient({ region: process.env.REGION });
const { DynamoDBClient } = require ("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand } = require ("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({}); 
const docClient = DynamoDBDocumentClient.from(client);



exports.newOrder = async (event) => {

    console.log(event);

    const orderId = uuidv4();
    console.log(orderId);

    let orderDetails;
    try {
        orderDetails = JSON.parse(event.body); 
    } catch (error) {
        console.error("Error parsing order details:", error);
        return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid JSON format in order details" }),
        };
    }

    console.log(orderDetails)

    const order = {orderId, ...orderDetails}

    //Save the order in DynamoDB
    await saveItemtoDynamoDB(order);
    

    //Send the order to the SQS Queue
    const queueURL = process.env.PENDING_ORDERS_QUEUE_URL
    await sendMessageToSQS(order, queueURL);

    return {
        statusCode: 200,
        body: JSON.stringify({
        message: order  
        }),
    };
}

exports.getOrder = async (event) => {
    console.log(event);

    const orderId = event.pathParameters.orderId

    const orderDetails = {
        "pizza": "Margarita",
        "size": "Medium",
        "quantity": 1
     }

    const order = {orderId, ...orderDetails}

    console.log(order);
    
    return {
        statusCode: 200,
        body: JSON.stringify({
        message: order
        }),
    };    
        


}

exports.prepOrder = async (event) => {

    console.log(event);

    const body = JSON.parse(event.Records[0].body);
    const orderId = body.orderId;

    await updateStatusInOrder(orderId, "COMPLETED");


    return; 
};

exports.sendOrder = async (event) => {
    console.log(event);

    const order = {
        orderId: event.orderId,
        pizza: event.pizza,
        customerId: event.customerId 
         }
    
    
    const queueURL = process.env.SEND_ORDERS_QUEUE_URL
    await sendMessageToSQS(order, queueURL);
    

}



async function sendMessageToSQS(message, queueURL){

  const params = {
    QueueUrl: queueURL,
    MessageBody: JSON.stringify(message)
  };
  
  try {
    const command = new SendMessageCommand(params);
    const data = await sqsClient.send(command);
    console.log("Message sent to SQS successfully", data.MessageId);
    return data;
  } catch (error) {
    console.error("Error sending message to SQS:", error)
    throw error;    
  }
}

async function saveItemtoDynamoDB(item){

    const params = {
        TableName: process.env.ORDER_TABLE_NAME,
        Item: item
    };

    console.log(params);

    try {
        const command = new PutCommand(params);
        const response = await docClient.send(command);
        console.log("item saved to dynamodb", response);
        return response;
    } catch (error) {
        console.error("Error saving item to dynamodb", error);
        throw error;        
    }

 }

async function updateStatusInOrder(orderId, status) {
 
     const params = {
       TableName: process.env.ORDERS_TABLE_NAME,
       Key: { orderId },
       UpdateExpression: "SET order_status = :c",
       ExpressionAttributeValues: {
         ":c": status
       },
       ReturnValues: "ALL_NEW"  
     };
     
 console.log(params)
 
     try {
         const command = new UpdateCommand(params);
         const response = await docClient.send(command);
         console.log("item updated in dynamodb", response);
         return response.Attributes; 
     } catch (err) {
         console.error("Error updating item in dynamodb", err);
         throw err;
     }
 
 } 

