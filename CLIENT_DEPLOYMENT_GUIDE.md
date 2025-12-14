# Client Deployment Guide - Pramana Manager v1.7.0

## Overview
This guide explains how to configure and deploy Pramana Manager for different clients with domain-restricted registration and email verification.

## Key Features
- **Domain-Restricted Registration**: Only users with approved email domains can register
- **Email Verification**: 5-minute timeout for email verification links
- **Client-Specific Configuration**: Easy customization per client

## Configuration Steps

### 1. Edit `client-config.properties`

```properties
# Client Information
client.name=INTTRA
client.domain=inttra.com
client.allowed.email.domains=inttra.com,inttra.co.in

# Registration Settings
registration.enabled=true
registration.email.verification.required=true
registration.email.verification.timeout.minutes=5

# Admin Settings
admin.default.email=admin@inttra.com
admin.default.password=Admin@123!

# SMTP Configuration
mail.smtp.host=smtp.gmail.com
mail.smtp.port=587
mail.smtp.username=noreply@inttra.com
mail.smtp.password=your-app-password
mail.smtp.from=noreply@inttra.com
mail.smtp.starttls.enable=true
```

### 2. How It Works

**Registration Flow:**
1. User enters email (e.g., user@inttra.com)
2. System validates email domain against `client.allowed.email.domains`
3. If valid, account created but marked as unverified
4. Verification email sent with 5-minute timeout token
5. User clicks link to verify email
6. Account activated for login

**Domain Validation:**
- Only emails from configured domains allowed
- Blocks @gmail.com, @yahoo.com, etc.
- Example: For INTTRA, only @inttra.com and @inttra.co.in allowed

### 3. For Each Client

Create a deployment package:

```
client-inttra/
├── backend/
│   ├── pramana-manager-1.7.0.jar
│   └── config/
│       └── client-config.properties  (customized)
├── frontend/
│   └── dist/ (built files)
├── scripts/
│   ├── start.bat / start.sh
│   └── stop.bat / stop.sh
└── README.md
```

### 4. Email SMTP Setup

**For Gmail:**
1. Enable 2-Step Verification
2. Generate App Password
3. Use app password in `mail.smtp.password`

**For Office 365:**
```properties
mail.smtp.host=smtp.office365.com
mail.smtp.port=587
```

**For Custom SMTP:**
```properties
mail.smtp.host=mail.company.com
mail.smtp.port=25
mail.smtp.starttls.enable=false
```

### 5. Database Setup

For production, update `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pramana_inttra
spring.datasource.username=pramana_user
spring.datasource.password=SecurePassword123!
```

### 6. Build and Deploy

```bash
# Build backend
cd backend
mvn clean package -DskipTests

# Build frontend
cd ..
npm run build

# Copy client config
cp client-config-inttra.properties backend/target/classes/client-config.properties

# Deploy
java -jar backend/target/pramana-manager-1.7.0.jar
```

## Security Checklist

- [ ] Change default admin password after first login
- [ ] Configure valid SMTP credentials
- [ ] Set strong JWT secret key
- [ ] Use HTTPS in production
- [ ] Restrict allowed email domains
- [ ] Set appropriate token expiration time
- [ ] Disable admin creation endpoint after setup

## Testing

1. **Test Domain Validation:**
   - Try registering with @gmail.com (should fail)
   - Try registering with @inttra.com (should succeed)

2. **Test Email Verification:**
   - Register new account
   - Check email for verification link
   - Verify link expires after 5 minutes
   - Verify login blocked until email verified

3. **Test Admin Access:**
   - Login with admin@inttra.com / Admin@123!
   - Change password immediately
   - Create test project

## Troubleshooting

**Email not sending:**
- Check SMTP credentials
- Verify SMTP server allows connection
- Check firewall rules for port 587/465

**Domain validation not working:**
- Verify `client-config.properties` loaded
- Check `client.allowed.email.domains` format
- Restart application after config changes

**Users can't verify email:**
- Check email spam folder
- Verify link format includes full URL
- Check token not expired (5 minutes)

## Multiple Clients

For multiple clients, maintain separate configs:

```
configs/
├── client-config-inttra.properties
├── client-config-maersk.properties
└── client-config-hapag.properties
```

Deploy each with its config:
```bash
java -jar -Dspring.config.import=classpath:client-config-inttra.properties pramana-manager-1.7.0.jar
```
