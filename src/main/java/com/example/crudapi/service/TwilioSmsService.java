package com.example.crudapi.service;

import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioSmsService implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(TwilioSmsService.class);

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.from-number:}")
    private String fromNumber;

    private boolean enabled;

    @PostConstruct
    void init() {
        enabled = !accountSid.isBlank() && !authToken.isBlank() && !fromNumber.isBlank();
        if (enabled) {
            Twilio.init(accountSid, authToken);
            log.info("Twilio SMS enabled (from={})", fromNumber);
        } else {
            log.warn("Twilio SMS disabled (credentials missing) - OTP will be logged to console only.");
        }
    }

    @Override
    public boolean sendOtp(String phone, String otp) {
        if (!enabled) {
            log.info("[DEV MODE - no SMS sent] OTP for {} = {}", phone, otp);
            return false;
        }
        try {
            Message message = Message.creator(
                    new PhoneNumber(phone),
                    new PhoneNumber(fromNumber),
                    "Your OTP code is: " + otp
            ).create();
            log.info("Sent OTP via Twilio to {} (sid={})", phone, message.getSid());
            return true;
        } catch (ApiException e) {
            log.error("Twilio SMS failed for {}: {}", phone, e.getMessage());
            throw new SmsDeliveryException("Failed to send OTP via SMS", e);
        }
    }
}
