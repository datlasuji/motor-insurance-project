# 🚗 Motor Insurance Claim Estimator

A web-based application that estimates the claim amount for a damaged vehicle based on vehicle details, damaged parts, repair cost, depreciation, labour charges, deductible, amount claimed, and available insurance amount.

## 📌 Problem Statement

Motor insurance claim estimation can be difficult for customers because they may not clearly understand how repair costs, damaged parts, depreciation, labour charges, and deductibles affect the final claim amount.

This project provides a simple and transparent way to estimate the claim amount based on the information entered by the user.

## 🎯 Objectives

- Collect vehicle details from the user
- Select damaged vehicle parts
- Calculate repair and labour costs
- Apply depreciation based on vehicle age and part type
- Apply voluntary deductible
- Consider the amount claimed by the customer
- Consider the available insurance amount
- Display the final estimated claim amount
- Provide a transparent calculation breakdown

## 🛠️ Technologies Used

### Frontend
- React.js
- Vite
- HTML
- CSS
- JavaScript

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic

### Database
- SQLite

## 🏗️ System Architecture

```text
User
  ↓
React Frontend
  ↓
FastAPI Backend
  ↓
SQLite Database
  ↓
Claim Calculation Engine
  ↓
Estimated Claim Result
