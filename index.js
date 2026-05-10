// Form validation
<script>
        const form = document.getElementById('registrationForm');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset error messages
            document.querySelectorAll('.error-message').forEach(msg => {
                msg.style.display = 'none';
            });

            let isValid = true;

            // Validate password match
            if (password.value !== confirmPassword.value) {
                document.getElementById('confirmPasswordError').style.display = 'block';
                isValid = false;
            }

            // Validate age
            const ageValue = parseInt(document.getElementById('age').value);
            if (ageValue < 18) {
                document.getElementById('ageError').style.display = 'block';
                isValid = false;
            }

            // If all validations pass, submit the form
            if (isValid) {
                alert('Registration successful!');
                form.submit(); // Uncomment to actually submit the form
            }
        });
    </script>