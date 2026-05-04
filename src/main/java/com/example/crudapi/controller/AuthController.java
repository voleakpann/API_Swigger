package com.example.crudapi.controller;

import com.example.crudapi.dto.SendOtpRequest;
import com.example.crudapi.dto.SendOtpResponse;
import com.example.crudapi.dto.VerifyOtpRequest;
import com.example.crudapi.dto.VerifyOtpResponse;
import com.example.crudapi.model.User;
import com.example.crudapi.repository.UserRepository;
import com.example.crudapi.service.SmsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final String DEFAULT_ROLE = "EMPLOYEE";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SmsService smsService;

    @PostMapping("/send-otp")
    public ResponseEntity<SendOtpResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        String phone = normalizePhone(request.getPhone());

        User user = userRepository.findByPhone(phone).orElseGet(() -> {
            User newUser = new User();
            newUser.setPhone(phone);
            newUser.setRole(DEFAULT_ROLE);
            return newUser;
        });

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        boolean smsSent = smsService.sendOtp(phone, otp);

        user.setOtpCode(otp);
        user.setOtpExpiredAt(expiresAt);
        userRepository.save(user);

        String message = smsSent
                ? "OTP sent via SMS"
                : "OTP generated (dev mode - SMS not sent, check server log)";
        return ResponseEntity.ok(new SendOtpResponse(phone, null, expiresAt, message));
    }

    private static String normalizePhone(String raw) {
        String digits = raw.replaceAll("[\\s\\-()]", "").trim();
        if (digits.startsWith("+")) {
            return digits;
        }
        if (digits.startsWith("855")) {
            return "+" + digits;
        }
        if (digits.startsWith("0")) {
            return "+855" + digits.substring(1);
        }
        return "+855" + digits;
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<VerifyOtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String phone = normalizePhone(request.getPhone());
        Optional<User> userOpt = userRepository.findByPhone(phone);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new VerifyOtpResponse(phone, null, null, "Phone not found"));
        }

        User user = userOpt.get();

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new VerifyOtpResponse(request.getPhone(), null, null, "Invalid OTP"));
        }

        if (user.getOtpExpiredAt() == null || user.getOtpExpiredAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new VerifyOtpResponse(request.getPhone(), null, null, "OTP has expired"));
        }

        user.setOtpCode(null);
        user.setOtpExpiredAt(null);
        userRepository.save(user);

        String token = Base64.getEncoder()
                .encodeToString((user.getPhone() + ":" + UUID.randomUUID()).getBytes());

        return ResponseEntity.ok(new VerifyOtpResponse(
                user.getPhone(), user.getRole(), token, "Login successful"));
    }
}
