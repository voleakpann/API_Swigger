package com.example.crudapi.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class SmsDeliveryException extends RuntimeException {

    public SmsDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
