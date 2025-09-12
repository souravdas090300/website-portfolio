/**
 * Contact Form Handler
 * Handles form validation, submission, and user feedback
 */

class ContactFormHandler {
  constructor() {
    this.form = document.getElementById("contact-form");
    this.submitBtn = document.getElementById("submit-btn");
    this.messagesDiv = document.getElementById("form-messages");
    this.btnText = this.submitBtn.querySelector(".btn-text");
    this.btnLoading = this.submitBtn.querySelector(".btn-loading");

    this.init();
  }

  init() {
    if (!this.form) return;

    // Add event listeners
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.form.addEventListener("input", this.handleInput.bind(this));
    this.form.addEventListener("change", this.handleInput.bind(this));

    // Add real-time validation
    const inputs = this.form.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );
    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearError(input));
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    if (!this.validateForm()) {
      this.showMessage("Please correct the errors above.", "error");
      return;
    }

    // Disable submit button and show loading
    this.setLoadingState(true);
    this.hideMessage();

    try {
      // Submit to Netlify
      const formData = new FormData(this.form);

      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });

      if (response.ok) {
        this.showMessage(
          "🎉 Thank you! Your message has been sent successfully. I'll get back to you within 24 hours!",
          "success"
        );
        this.form.reset();
        this.clearAllErrors();

        // Track form submission (optional analytics)
        if (typeof gtag !== "undefined") {
          gtag("event", "form_submit", {
            event_category: "engagement",
            event_label: "contact_form",
          });
        }
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      this.showMessage(
        "❌ Sorry, there was an error sending your message. Please try again or contact me directly via email.",
        "error"
      );
    } finally {
      this.setLoadingState(false);
    }
  }

  validateForm() {
    const requiredFields = this.form.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let errorMessage = "";

    // Clear previous error
    this.clearError(field);

    // Required field validation
    if (field.hasAttribute("required") && !value) {
      errorMessage = `${this.getFieldDisplayName(fieldName)} is required.`;
    } else if (value) {
      // Specific field validations
      switch (field.type) {
        case "email":
          if (!this.isValidEmail(value)) {
            errorMessage = "Please enter a valid email address.";
          }
          break;
        case "text":
          if (fieldName === "name" && value.length < 2) {
            errorMessage = "Name must be at least 2 characters long.";
          }
          break;
      }

      // Message length validation
      if (fieldName === "message") {
        if (value.length < 10) {
          errorMessage = "Message must be at least 10 characters long.";
        } else if (value.length > 1000) {
          errorMessage = "Message must be less than 1000 characters.";
        }
      }
    }

    if (errorMessage) {
      this.showFieldError(field, errorMessage);
      return false;
    }

    return true;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getFieldDisplayName(fieldName) {
    const displayNames = {
      name: "Full Name",
      email: "Email Address",
      subject: "Subject",
      message: "Message",
      company: "Company",
    };
    return displayNames[fieldName] || fieldName;
  }

  showFieldError(field, message) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      field.setAttribute("aria-invalid", "true");
      field.style.borderColor = "#dc3545";
    }
  }

  clearError(field) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
      errorElement.textContent = "";
      field.removeAttribute("aria-invalid");
      field.style.borderColor = "";
    }
  }

  clearAllErrors() {
    const errorElements = this.form.querySelectorAll(".error-message");
    errorElements.forEach((element) => (element.textContent = ""));

    const fields = this.form.querySelectorAll("input, select, textarea");
    fields.forEach((field) => {
      field.removeAttribute("aria-invalid");
      field.style.borderColor = "";
    });
  }

  showMessage(message, type) {
    this.messagesDiv.textContent = message;
    this.messagesDiv.className = `form-messages ${type}`;
    this.messagesDiv.style.display = "block";

    // Scroll to message
    this.messagesDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  hideMessage() {
    this.messagesDiv.style.display = "none";
    this.messagesDiv.className = "form-messages";
  }

  setLoadingState(isLoading) {
    this.submitBtn.disabled = isLoading;

    if (isLoading) {
      this.btnText.style.display = "none";
      this.btnLoading.style.display = "inline";
    } else {
      this.btnText.style.display = "inline";
      this.btnLoading.style.display = "none";
    }
  }

  handleInput(e) {
    const field = e.target;

    // Clear error when user starts typing
    if (field.hasAttribute("aria-invalid")) {
      this.clearError(field);
    }

    // Update character count for message field
    if (field.name === "message") {
      this.updateCharacterCount(field);
    }
  }

  updateCharacterCount(textarea) {
    const maxLength = 1000;
    const currentLength = textarea.value.length;

    // Create or update character counter
    let counter = document.getElementById("message-counter");
    if (!counter) {
      counter = document.createElement("div");
      counter.id = "message-counter";
      counter.style.cssText =
        "font-size: 12px; color: #666; text-align: right; margin-top: 5px;";
      textarea.parentNode.appendChild(counter);
    }

    counter.textContent = `${currentLength}/${maxLength} characters`;

    if (currentLength > maxLength) {
      counter.style.color = "#dc3545";
    } else if (currentLength > maxLength * 0.9) {
      counter.style.color = "#ffc107";
    } else {
      counter.style.color = "#666";
    }
  }
}

// Initialize form handler when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ContactFormHandler();
});

// Handle form pre-fill from URL parameters (optional feature)
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const subject = urlParams.get("subject");
  const message = urlParams.get("message");

  if (subject) {
    const subjectField = document.getElementById("subject");
    if (subjectField) {
      subjectField.value = subject;
    }
  }

  if (message) {
    const messageField = document.getElementById("message");
    if (messageField) {
      messageField.value = decodeURIComponent(message);
    }
  }
});
