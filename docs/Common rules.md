# Table
- [Email rule](#email-rule)
- [Password rule](#password-rule)
- [Username Rules](#username-rules)
- [PIN Code Rules](#pin-code-rules)
- [Avatar Pictures Rules](#avatar-pictures-rules)

## Email Rules
```javascript
EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```

- Your email should look like a standard email address.<br>
- It starts with one or more letters, numbers, or these special characters: `. _ % + -`<br>
- Then comes the @ symbol.<br>
- After the @, there should be a domain name made of letters, numbers, dots, or dashes.<br>
- Finally, the domain ends with a dot followed by at least two letters (like `.com`, `.org`, `.fi`).<br>

In short:<br>
Your email should be something like `user.name+tag@example-domain.com`.<br>

## Password Rules

```javascript
PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,72}$/;
```
- Your password Total length between 8 and 72 characters(include 8 and 72).<br>
- It needs to have at least one lowercase letter (like `a`, `b`, `c`).<br>
- It needs at least one uppercase letter (like `A`, `B`, `C`).<br>
- It requires at least one number (like `1`, `2`, `3`).<br>
- It must include at least one special character from this set: `@ $ ! % * ? &`.<br>
- The password can only contain letters (uppercase and lowercase), numbers, and the special characters mentioned.<br>

In short:
Make a strong password with a mix of uppercase, lowercase, numbers, and symbols, like `StrongP@ss1`.<br>

## Username Rules
```javascript
USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9._-]{5,19}$/;
```
- **Start with a letter**<br>
  - The first character **must be a-z or A-Z**.<br>

- **Length: 6 to 20 characters total**<br>
  - After the first letter, there must be 5 to 19 additional characters, so the full length is between 6 and 20 characters.<br>
- **Allowed characters after the first:**<br>
  - Letters: `a-z`, `A-Z`<br>
  - Numbers: `0-9`<br>
  - Special characters: `._-`<br>

🧠 **Examples of valid usernames:**
  - john_doe
  - Alice99
  - mike-test
  - Z.user-1

❌ **Examples of invalid usernames:**
  - 1username → starts with a number
  - ab → too short
  - user!name → ! is not allowed
  - john.doe.verylongusername123 → too long (over 20)

## PIN Code Rules
```javascript
PINCODE_REGEX = /^\d{4}$/;
```
4 integers.<br>


## Avatar Pictures Rules
1. max 5MB;
2. Only support: `.jpg`, `.jpeg`, `.png`,`.webp` and `.gif`;
