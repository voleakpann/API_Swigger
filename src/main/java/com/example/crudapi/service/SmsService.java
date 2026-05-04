package com.example.crudapi.service;

public interface SmsService {

    boolean sendOtp(String phone, String otp);
}
