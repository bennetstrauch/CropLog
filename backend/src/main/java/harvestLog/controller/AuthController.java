package harvestLog.controller;

import harvestLog.dto.*;
import harvestLog.model.Farmer;
import harvestLog.repository.FarmerRepository;
import harvestLog.security.JwtUtilityService;
import harvestLog.service.EmailService;
import harvestLog.service.impl.FarmerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtilityService jwtService;
    @Autowired
    private FarmerService farmerService;
    @Autowired
    private FarmerRepository farmerRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<FarmerBasicResponse> registerFarmer(
            @Valid @RequestBody FarmerRegistrationRequest registrationRequest) {

        if (farmerService.existsByFarmerEmail(registrationRequest.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }

        String token = UUID.randomUUID().toString();

        Farmer farmer = new Farmer();
        farmer.setName(registrationRequest.name());
        farmer.setEmail(registrationRequest.email());
        farmer.setPassword(passwordEncoder.encode(registrationRequest.password()));
        farmer.setEmailVerified(false);
        farmer.setVerificationToken(token);
        farmer.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));

        Farmer savedFarmer = farmerService.create(farmer);
        try {
            emailService.sendVerificationEmail(savedFarmer.getEmail(), token);
        } catch (Exception e) {
            // Registration succeeds even if email fails; check mail config
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new FarmerBasicResponse(savedFarmer.getId(), savedFarmer.getName(), savedFarmer.getEmail()));
    }

    @GetMapping("/verify")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        Farmer farmer = farmerRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification token"));

        if (farmer.isEmailVerified()) {
            return ResponseEntity.ok().build();
        }

        if (farmer.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token has expired");
        }

        farmer.setEmailVerified(true);
        farmerRepository.save(farmer);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Farmer farmer = farmerService.findByEmail(request.email());

        if (!passwordEncoder.matches(request.password(), farmer.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!farmer.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Email not verified. Please check your inbox.");
        }

        String token = jwtService.generateToken(farmer.getEmail(), farmer.getId());
        return ResponseEntity.ok(new LoginResponse(token));
    }
}
