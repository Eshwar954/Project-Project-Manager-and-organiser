package com.smartboard.smartboard.security;

import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
@Component
@RequiredArgsConstructor
public class JwtUtil {
    private final String SECRET = "your-256-bit-secret-key-here-make-it-long";

    public String generateToken(String email){
        return Jwts.builder()
        .setSubject(email)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 86400000))
        .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()),SignatureAlgorithm.HS256)
        .compact();
    }
    public String extractEmail(String token){
        return Jwts.parserBuilder()
        .setSigningKey(Keys.hmacShaKeyFor(SECRET.getBytes()))
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
    }

    private boolean TokenExipred(String token){
        return Jwts.parserBuilder()
        .setSigningKey(Keys.hmacShaKeyFor(SECRET.getBytes()))
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getExpiration()
        .before(new Date());
    }
    public boolean validateToken(String token, String email){
        return extractEmail(token).equals(email)&&!TokenExipred(token);
    }
}