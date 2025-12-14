# Client Configuration Examples

## How to Configure for Different Clients

Update `client-config.properties` for each deployment.

---

## Example 1: INTTRA

```properties
# Client Information
client.name=INTTRA
client.domain=inttra.com
client.allowed.email.domains=inttra.com,inttra.co.in

# Registration Settings
registration.enabled=true
registration.email.verification.required=false

# Admin Settings
admin.default.email=admin@inttra.com
admin.default.password=Inttra@2024!

# SMTP (if needed later)
mail.smtp.host=smtp.office365.com
mail.smtp.username=noreply@inttra.com
```

---

## Example 2: Maersk

```properties
# Client Information
client.name=Maersk
client.domain=maersk.com
client.allowed.email.domains=maersk.com

# Admin Settings
admin.default.email=admin@maersk.com
admin.default.password=Maersk@2024!
```

---

## Example 3: Generic Company

```properties
# Client Information
client.name=ABC Corp
client.domain=abccorp.com
client.allowed.email.domains=abccorp.com,abc.com

# Admin Settings
admin.default.email=testmanager@abccorp.com
admin.default.password=SecurePass123!
```

---

## Deployment Steps

1. **Copy `client-config.properties` to backend resources**
   ```bash
   cp client-config-inttra.properties backend/src/main/resources/client-config.properties
   ```

2. **Build with config**
   ```bash
   cd backend
   mvn clean package
   ```

3. **Start application**
   ```bash
   java -jar target/pramana-manager-1.7.0.jar
   ```

4. **Create admin (one-time)**
   ```bash
   curl -X POST http://localhost:8080/api/admin/create-admin
   ```

5. **Login with configured admin credentials**
   - Email: admin@inttra.com
   - Password: Inttra@2024!

---

## Features Status

### Currently Active:
- ✅ Registration open to all emails
- ✅ Admin credentials from config file
- ✅ No email verification required

### Available (Disabled by Default):
- ⏸️ Domain-restricted registration
- ⏸️ Email verification with 5-min timeout

### To Enable Domain Restriction:
Set in `client-config.properties`:
```properties
client.allowed.email.domains=inttra.com,inttra.co.in
```

Then uncomment validation in `AuthService.java` (line 42-45)

### To Enable Email Verification:
Set in `client-config.properties`:
```properties
registration.email.verification.required=true
mail.smtp.host=smtp.gmail.com
mail.smtp.username=your-email@gmail.com
mail.smtp.password=your-app-password
```

Then uncomment verification code in `AuthService.java` (line 60-64)
