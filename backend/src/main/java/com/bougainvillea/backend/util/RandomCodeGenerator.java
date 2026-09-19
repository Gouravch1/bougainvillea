package com.bougainvillea.backend.util;

import java.util.Random;

import org.springframework.stereotype.Component;

@Component
public class RandomCodeGenerator {
    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    public String generateCode(){
        Random random = new Random();
        StringBuilder code = new StringBuilder();


        for(int i = 0; i < 6; i++){
            code.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return code.toString();
    }
}
