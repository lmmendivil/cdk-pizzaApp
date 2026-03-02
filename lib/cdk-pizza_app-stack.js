"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkPizzaAppStack = void 0;
const cdk = __importStar(require("aws-cdk-lib/core"));
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const aws_sqs_1 = require("aws-cdk-lib/aws-sqs");
const aws_lambda_event_sources_1 = require("aws-cdk-lib/aws-lambda-event-sources");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
class CdkPizzaAppStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //SQS
        const pendingOrdersQueue = new aws_sqs_1.Queue(this, 'PendingOrdersQueue', {});
        const sendOrdersQueue = new aws_sqs_1.Queue(this, 'sendOrdersQueue', {});
        //DYNAMODB
        const ordersTable = new aws_dynamodb_1.Table(this, 'OrdersTable', {
            partitionKey: { name: 'orderId', type: aws_dynamodb_1.AttributeType.STRING },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST,
        });
        //FUNCTIONS 
        const newOrderFunction = new aws_lambda_1.Function(this, 'NewOrderFuncion', {
            runtime: aws_lambda_1.Runtime.NODEJS_22_X,
            handler: 'handler.newOrder',
            code: aws_lambda_1.Code.fromAsset('lib/functions'),
            environment: {
                PENDING_ORDERS_QUEUE_URL: pendingOrdersQueue.queueUrl,
                ORDER_TABLE_NAME: ordersTable.tableName,
            }
        });
        pendingOrdersQueue.grantSendMessages(newOrderFunction);
        ordersTable.grantWriteData(newOrderFunction);
        const getOrderFunction = new aws_lambda_1.Function(this, 'GetOrderFuncion', {
            runtime: aws_lambda_1.Runtime.NODEJS_22_X,
            handler: 'handler.getOrder',
            code: aws_lambda_1.Code.fromAsset('lib/functions'),
            environment: {
                ORDER_TABLE_NAME: ordersTable.tableName,
            }
        });
        ordersTable.grantReadData(getOrderFunction);
        const prepOrderFunction = new aws_lambda_1.Function(this, 'PrepOrderFuncion', {
            runtime: aws_lambda_1.Runtime.NODEJS_22_X,
            handler: 'handler.prepOrder',
            code: aws_lambda_1.Code.fromAsset('lib/functions'),
            environment: {
                ORDERS_TABLE_NAME: ordersTable.tableName,
            }
        });
        prepOrderFunction.addEventSource(new aws_lambda_event_sources_1.SqsEventSource(pendingOrdersQueue, {
            batchSize: 1
        }));
        ordersTable.grantWriteData(prepOrderFunction);
        const sendOrderFunction = new aws_lambda_1.Function(this, 'SendOrderFuncion', {
            runtime: aws_lambda_1.Runtime.NODEJS_22_X,
            handler: 'handler.sendOrder',
            code: aws_lambda_1.Code.fromAsset('lib/functions'),
            environment: {
                SEND_ORDERS_QUEUE_URL: sendOrdersQueue.queueUrl,
            }
        });
        sendOrderFunction.addEventSource(new aws_lambda_event_sources_1.DynamoEventSource(ordersTable, {
            startingPosition: aws_lambda_1.StartingPosition.LATEST,
            batchSize: 1,
            filters: [
                aws_lambda_1.FilterCriteria.filter({
                    eventName: ['MODIFY']
                })
            ]
        }));
        sendOrdersQueue.grantSendMessages(sendOrderFunction);
        ordersTable.grantStreamRead(sendOrderFunction);
        //API GATEWAY
        const api = new apigateway.RestApi(this, 'PizzeriaApi', {
            restApiName: 'Pizzeria CDK Service',
        });
        const orderResource = api.root.addResource('order');
        orderResource.addMethod('POST', new apigateway.LambdaIntegration(newOrderFunction));
        orderResource.addResource('{orderId}').addMethod('GET', new apigateway.LambdaIntegration(getOrderFunction));
    }
}
exports.CdkPizzaAppStack = CdkPizzaAppStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXBpenphX2FwcC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNkay1waXp6YV9hcHAtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0RBQXdDO0FBRXhDLHVEQUFtRztBQUNuRyx1RUFBeUQ7QUFDekQsaURBQTRDO0FBQzVDLG1GQUF5RjtBQUN6RiwyREFBNkU7QUFJN0UsTUFBYSxnQkFBaUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUM3QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTVCLEtBQUs7UUFDRCxNQUFNLGtCQUFrQixHQUFHLElBQUksZUFBSyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyRSxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFbkUsVUFBVTtRQUNOLE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQUssQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFDO1lBQzlDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLDRCQUFhLENBQUMsTUFBTSxFQUFFO1lBQzdELFdBQVcsRUFBQywwQkFBVyxDQUFDLGVBQWU7U0FDeEMsQ0FBQyxDQUFBO1FBS1IsWUFBWTtRQUNSLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxxQkFBUSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUM3RCxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1lBQzVCLE9BQU8sRUFBRSxrQkFBa0I7WUFDM0IsSUFBSSxFQUFFLGlCQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQztZQUNyQyxXQUFXLEVBQUU7Z0JBQ1gs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ZnJvbSAnYXdzLWNkay1saWIvY29yZSc7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgeyBGdW5jdGlvbiwgUnVudGltZSwgQ29kZSwgU3RhcnRpbmdQb3NpdGlvbiwgRmlsdGVyQ3JpdGVyaWEgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcclxuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XHJcbmltcG9ydCB7IFF1ZXVlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XHJcbmltcG9ydCB7IER5bmFtb0V2ZW50U291cmNlLCBTcXNFdmVudFNvdXJjZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtZXZlbnQtc291cmNlcyc7XHJcbmltcG9ydCB7IEF0dHJpYnV0ZVR5cGUsIEJpbGxpbmdNb2RlLCBUYWJsZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XHJcbmltcG9ydCB7IFJlbW92YWxQb2xpY3kgfSBmcm9tICdhd3MtY2RrLWxpYic7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIENka1BpenphQXBwU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuLy9TUVNcclxuICAgIGNvbnN0IHBlbmRpbmdPcmRlcnNRdWV1ZSA9IG5ldyBRdWV1ZSh0aGlzLCAnUGVuZGluZ09yZGVyc1F1ZXVlJywge30pO1xyXG4gICAgY29uc3Qgc2VuZE9yZGVyc1F1ZXVlID0gbmV3IFF1ZXVlKHRoaXMsICdzZW5kT3JkZXJzUXVldWUnLCB7fSk7XHJcblxyXG4vL0RZTkFNT0RCXHJcbiAgICBjb25zdCBvcmRlcnNUYWJsZSA9IG5ldyBUYWJsZSh0aGlzLCAnT3JkZXJzVGFibGUnLHtcclxuICAgICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ29yZGVySWQnLCB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICAgIGJpbGxpbmdNb2RlOkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCwgXHJcbiAgICAgIH0pXHJcbiAgICBcclxuICAgICAgXHJcblxyXG5cclxuLy9GVU5DVElPTlMgXHJcbiAgICBjb25zdCBuZXdPcmRlckZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKHRoaXMsICdOZXdPcmRlckZ1bmNpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzIyX1gsXHJcbiAgICAgIGhhbmRsZXI6ICdoYW5kbGVyLm5ld09yZGVyJyxcclxuICAgICAgY29kZTogQ29kZS5mcm9tQXNzZXQoJ2xpYi9mdW5jdGlvbnMnKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBQRU5ESU5HX09SREVSU19RVUVVRV9VUkw6IHBlbmRpbmdPcmRlcnNRdWV1ZS5xdWV1ZVVybCxcclxuICAgICAgICBPUkRFUl9UQUJMRV9OQU1FOiBvcmRlcnNUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIH0gIFxyXG4gICAgICAgICAgIFxyXG59KTtcclxuICAgIHBlbmRpbmdPcmRlcnNRdWV1ZS5ncmFudFNlbmRNZXNzYWdlcyhuZXdPcmRlckZ1bmN0aW9uKTtcclxuICAgIG9yZGVyc1RhYmxlLmdyYW50V3JpdGVEYXRhKG5ld09yZGVyRnVuY3Rpb24pO1xyXG5cclxuXHJcblxyXG4gICAgY29uc3QgZ2V0T3JkZXJGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCAnR2V0T3JkZXJGdW5jaW9uJywge1xyXG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18yMl9YLFxyXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlci5nZXRPcmRlcicsXHJcbiAgICAgIGNvZGU6IENvZGUuZnJvbUFzc2V0KCdsaWIvZnVuY3Rpb25zJyksXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgT1JERVJfVEFCTEVfTkFNRTogb3JkZXJzVGFibGUudGFibGVOYW1lLFxyXG4gICAgICB9XHJcblxyXG59KTtcclxuXHJcbiAgICBvcmRlcnNUYWJsZS5ncmFudFJlYWREYXRhKGdldE9yZGVyRnVuY3Rpb24pO1xyXG5cclxuICAgIFxyXG5cclxuICAgIGNvbnN0IHByZXBPcmRlckZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKHRoaXMsICdQcmVwT3JkZXJGdW5jaW9uJywge1xyXG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18yMl9YLFxyXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlci5wcmVwT3JkZXInLFxyXG4gICAgICBjb2RlOiBDb2RlLmZyb21Bc3NldCgnbGliL2Z1bmN0aW9ucycpLCAgXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgT1JERVJTX1RBQkxFX05BTUU6IG9yZGVyc1RhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgfVxyXG59KTtcclxuICAgIFxyXG4gICAgcHJlcE9yZGVyRnVuY3Rpb24uYWRkRXZlbnRTb3VyY2UobmV3IFNxc0V2ZW50U291cmNlKHBlbmRpbmdPcmRlcnNRdWV1ZSwge1xyXG4gICAgICBiYXRjaFNpemU6IDFcclxuICAgIH0pKTtcclxuICAgIFxyXG4gICAgb3JkZXJzVGFibGUuZ3JhbnRXcml0ZURhdGEocHJlcE9yZGVyRnVuY3Rpb24pO1xyXG4gIFxyXG5cclxuXHJcbiAgICBjb25zdCBzZW5kT3JkZXJGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCAnU2VuZE9yZGVyRnVuY2lvbicsIHtcclxuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMjJfWCxcclxuICAgICAgaGFuZGxlcjogJ2hhbmRsZXIuc2VuZE9yZGVyJyxcclxuICAgICAgY29kZTogQ29kZS5mcm9tQXNzZXQoJ2xpYi9mdW5jdGlvbnMnKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBTRU5EX09SREVSU19RVUVVRV9VUkw6IHNlbmRPcmRlcnNRdWV1ZS5xdWV1ZVVybCxcclxuICAgICAgfVxyXG59KTtcclxuICAgIFxyXG4gICAgc2VuZE9yZGVyRnVuY3Rpb24uYWRkRXZlbnRTb3VyY2UobmV3IER5bmFtb0V2ZW50U291cmNlKG9yZGVyc1RhYmxlLCB7XHJcbiAgICAgIHN0YXJ0aW5nUG9zaXRpb246IFN0YXJ0aW5nUG9zaXRpb24uTEFURVNULFxyXG4gICAgICBiYXRjaFNpemU6IDEsXHJcbiAgICAgIGZpbHRlcnM6IFtcclxuICAgICAgICBGaWx0ZXJDcml0ZXJpYS5maWx0ZXIoe1xyXG4gICAgICAgICAgZXZlbnROYW1lOiBbJ01PRElGWSddXHJcbiAgICAgICAgfSlcclxuICAgICAgXVxyXG4gIH0pKTtcclxuXHJcbiAgICBzZW5kT3JkZXJzUXVldWUuZ3JhbnRTZW5kTWVzc2FnZXMoc2VuZE9yZGVyRnVuY3Rpb24pO1xyXG4gICAgb3JkZXJzVGFibGUuZ3JhbnRTdHJlYW1SZWFkKHNlbmRPcmRlckZ1bmN0aW9uKTtcclxuXHJcblxyXG4vL0FQSSBHQVRFV0FZXHJcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdQaXp6ZXJpYUFwaScsIHtcclxuICAgICAgcmVzdEFwaU5hbWU6ICdQaXp6ZXJpYSBDREsgU2VydmljZScsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG9yZGVyUmVzb3VyY2UgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnb3JkZXInKTtcclxuICAgIG9yZGVyUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24obmV3T3JkZXJGdW5jdGlvbikpOyAgXHJcbiAgICBvcmRlclJlc291cmNlLmFkZFJlc291cmNlKCd7b3JkZXJJZH0nKS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldE9yZGVyRnVuY3Rpb24pKTtcclxuICBcclxuXHJcbiBcclxuXHJcblxyXG4gIH1cclxufVxyXG4iXX0=