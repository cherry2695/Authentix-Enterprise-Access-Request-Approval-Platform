package com.accessflow.exception;

/** Validation failures, duplicate requests, invalid state transitions, etc. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
