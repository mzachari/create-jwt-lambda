"use strict";
const jwt = require("jsonwebtoken");
const aws = require("aws-sdk");
const client = new aws.DynamoDB.DocumentClient();

module.exports.createJWT = async (event) => {
  const requestBody = JSON.parse(event.body);

  const id = requestBody.id;
  const invoiceId = requestBody.invoiceId;
  let expiryDate  = requestBody.expiryDate;

  expiryDate = new Date(expiryDate);
  const now = new Date();
  const expirationTime = expiryDate.getTime() - now.getTime();
  
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: expirationTime,
  });
  console.log(token);
  const emailVerificationItem =  {
    PK: `USER#${id}`,
    SK: `INVOICE#${invoiceId}`,
    expiryDate: requestBody.expiryDate,
    jwt: token
  }
  const params = {
    TableName: process.env.emailVerificationTableName,
    Item: emailVerificationItem,
  };
  try{
    const tableEntry = await client.put(params).promise();
    console.log(tableEntry);
  } catch(err){
    console.log("error occured", err);
  }
  return {
    statusCode: 200,
    body: token,
  };
};
