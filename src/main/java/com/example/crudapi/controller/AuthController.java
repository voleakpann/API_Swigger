package com.example.crudapi.controller;

import com.example.crudapi.dto.VerifyOtpRequest;
import com.example.crudapi.dto.VerifyOtpResponse;
import com.example.crudapi.model.User;
import com.example.crudapi.repository.UserRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Base64;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final String DEFAULT_ROLE = "EMPLOYEE";

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/verify-otp")
    public ResponseEntity<VerifyOtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        if (FirebaseApp.getApps().isEmpty()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new VerifyOtpResponse(null, null, null,
                            "Firebase not configured (set FIREBASE_CREDENTIALS_PATH)"));
        }

        FirebaseToken decoded;
        try {
            decoded = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new VerifyOtpResponse(null, null, null, "Invalid or expired Firebase token"));
        }

        Object phoneClaim = decoded.getClaims().get("phone_number");
        if (!(phoneClaim instanceof String) || ((String) phoneClaim).isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new VerifyOtpResponse(null, null, null, "Token has no phone_number"));
        }
        String phone = (String) phoneClaim;

        User user = userRepository.findByPhone(phone).orElseGet(() -> {
            User u = new User();
            u.setPhone(phone);
            u.setRole(DEFAULT_ROLE);
            return u;
        });
        userRepository.save(user);

        String token = Base64.getEncoder()
                .encodeToString((user.getPhone() + ":" + UUID.randomUUID()).getBytes());

        return ResponseEntity.ok(new VerifyOtpResponse(
                user.getPhone(), user.getRole(), token, "Login successful"));
    }
}
