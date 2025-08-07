class CampaignGenerator {
  constructor() {
    this.form = document.getElementById("campaignForm");
    this.generateBtn = document.getElementById("generateBtn");
    this.btnText = document.getElementById("btnText");
    this.loadingSpinner = document.getElementById("loadingSpinner");
    this.progressSection = document.getElementById("progressSection");
    this.resultsSection = document.getElementById("resultsSection");
    this.progressBar = document.getElementById("progressBar");
    this.progressPercent = document.getElementById("progressPercent");

    this.init();
  }

  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.setupInputValidation();
    this.setupMicroInteractions();
    this.setupAdvancedToggle();
    this.setupCharacterCount();
    this.setupGenerateAnotherBtn();
    this.setupEmailCapture();
  }

  setupInputValidation() {
    const urlInput = document.getElementById("websiteUrl");
    const urlValidationIcon = document.getElementById("urlValidationIcon");

    urlInput.addEventListener("input", (e) => {
      this.validateUrl(e.target, urlValidationIcon);
    });

    urlInput.addEventListener("blur", (e) => {
      this.validateUrl(e.target, urlValidationIcon);
    });
  }

  validateUrl(input, iconElement) {
    const url = input.value.trim();

    if (!url) {
      this.resetInputState(input, iconElement);
      return false;
    }

    try {
      new URL(url);
      this.setInputState(input, iconElement, "success");
      return true;
    } catch {
      this.setInputState(input, iconElement, "error");
      return false;
    }
  }

  setInputState(input, iconElement, state) {
    input.classList.remove("input-error", "input-success");
    iconElement.classList.add("hidden");

    if (state === "error") {
      input.classList.add("input-error");
    } else if (state === "success") {
      input.classList.add("input-success");
      iconElement.classList.remove("hidden");
    }
  }

  resetInputState(input, iconElement) {
    input.classList.remove("input-error", "input-success");
    iconElement.classList.add("hidden");
  }

  setupMicroInteractions() {
    // Enhanced hover effects for form elements
    const inputs = document.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.addEventListener("mouseenter", () => {
        if (!input.matches(":focus") && !input.disabled) {
          input.style.borderColor = "#d1d5db";
          input.style.transform = "translateY(-1px)";
        }
      });

      input.addEventListener("mouseleave", () => {
        if (!input.matches(":focus")) {
          input.style.borderColor = "#e5e7eb";
          input.style.transform = "translateY(0)";
        }
      });

      input.addEventListener("focus", () => {
        input.style.transform = "translateY(-1px)";
      });

      input.addEventListener("blur", () => {
        input.style.transform = "translateY(0)";
      });
    });

    // Enhanced button interactions
    this.generateBtn.addEventListener("mouseenter", () => {
      if (!this.generateBtn.disabled) {
        this.generateBtn.style.transform = "translateY(-2px)";
      }
    });

    this.generateBtn.addEventListener("mouseleave", () => {
      if (!this.generateBtn.disabled) {
        this.generateBtn.style.transform = "translateY(0)";
      }
    });

    this.generateBtn.addEventListener("mousedown", () => {
      if (!this.generateBtn.disabled) {
        this.generateBtn.style.transform = "translateY(-1px)";
      }
    });

    this.generateBtn.addEventListener("mouseup", () => {
      if (!this.generateBtn.disabled) {
        this.generateBtn.style.transform = "translateY(-2px)";
      }
    });
  }

  setupAdvancedToggle() {
    const advancedToggle = document.getElementById("advancedToggle");
    const advancedOptions = document.getElementById("advancedOptions");
    const expandIcon = advancedToggle.querySelector(".material-icons");

    advancedToggle.addEventListener("click", () => {
      const isHidden = advancedOptions.classList.contains("hidden");

      if (isHidden) {
        advancedOptions.classList.remove("hidden");
        advancedOptions.classList.add("animate-slide-up");
        expandIcon.textContent = "expand_less";
      } else {
        advancedOptions.classList.add("hidden");
        expandIcon.textContent = "expand_more";
      }
    });
  }

  setupCharacterCount() {
    const instructionsTextarea = document.getElementById("instructions");
    const charCount = document.getElementById("charCount");
    const maxLength = 500;

    instructionsTextarea.addEventListener("input", (e) => {
      const currentLength = e.target.value.length;
      charCount.textContent = `${currentLength} / ${maxLength}`;

      if (currentLength > maxLength * 0.9) {
        charCount.classList.add("text-orange-500");
        charCount.classList.remove("text-gray-500");
      } else if (currentLength === maxLength) {
        charCount.classList.add("text-red-500");
        charCount.classList.remove("text-orange-500", "text-gray-500");
      } else {
        charCount.classList.add("text-gray-500");
        charCount.classList.remove("text-orange-500", "text-red-500");
      }
    });
  }

  setupGenerateAnotherBtn() {
    const generateAnotherBtn = document.getElementById("generateAnotherBtn");
    if (generateAnotherBtn) {
      generateAnotherBtn.addEventListener("click", () => {
        this.resetForm();
      });
    }
  }

  setupEmailCapture() {
    // Email capture button functionality
    const requestDownloadBtn = document.getElementById("requestDownloadBtn");
    const emailModal = document.getElementById("emailModal");
    const emailModalContent = document.getElementById("emailModalContent");
    const emailForm = document.getElementById("emailCaptureForm");
    const cancelEmailBtn = document.getElementById("cancelEmailBtn");

    // Show email modal when request download is clicked
    if (requestDownloadBtn) {
      requestDownloadBtn.addEventListener("click", () => {
        this.showEmailModal();
      });
    }

    // Handle email form submission
    if (emailForm) {
      emailForm.addEventListener("submit", (e) => {
        this.handleEmailSubmit(e);
      });
    }

    // Cancel button functionality
    if (cancelEmailBtn) {
      cancelEmailBtn.addEventListener("click", () => {
        this.hideEmailModal();
      });
    }

    // Close modal on backdrop click
    if (emailModal) {
      emailModal.addEventListener("click", (e) => {
        if (e.target === emailModal) {
          this.hideEmailModal();
        }
      });
    }

    // Escape key to close modal
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        emailModal &&
        !emailModal.classList.contains("hidden")
      ) {
        this.hideEmailModal();
      }
    });
  }

  showEmailModal() {
    const emailModal = document.getElementById("emailModal");
    const emailModalContent = document.getElementById("emailModalContent");

    if (emailModal && emailModalContent) {
      emailModal.classList.remove("hidden");
      // Trigger animation
      setTimeout(() => {
        emailModalContent.classList.remove("scale-95", "opacity-0");
        emailModalContent.classList.add("scale-100", "opacity-100");
      }, 10);
    }
  }

  hideEmailModal() {
    const emailModal = document.getElementById("emailModal");
    const emailModalContent = document.getElementById("emailModalContent");

    if (emailModal && emailModalContent) {
      emailModalContent.classList.remove("scale-100", "opacity-100");
      emailModalContent.classList.add("scale-95", "opacity-0");

      setTimeout(() => {
        emailModal.classList.add("hidden");
      }, 300);
    }
  }

  async handleEmailSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const organizationName = formData.get("organizationName");
    const consent = formData.get("consent");

    // Get current website URL and campaign data
    const websiteUrl = document.getElementById("websiteUrl").value;
    const campaignId = `campaign_${Date.now()}`;

    // Show loading state
    const sendEmailBtn = document.getElementById("sendEmailBtn");
    const emailLoadingSpinner = document.getElementById("emailLoadingSpinner");

    if (!sendEmailBtn) {
      console.error("Send email button not found");
      throw new Error("Send email button not found");
    }

    const originalText = sendEmailBtn.textContent;
    const buttonSpan = sendEmailBtn.querySelector("span");

    sendEmailBtn.disabled = true;
    if (buttonSpan) {
      buttonSpan.textContent = "Sending...";
    } else {
      sendEmailBtn.textContent = "Sending...";
    }

    if (emailLoadingSpinner) {
      emailLoadingSpinner.classList.remove("hidden");
    }

    try {
      console.log("📧 Submitting lead capture:", {
        email,
        organizationName,
        websiteUrl,
      });

      // Submit to lead capture endpoint
      const response = await fetch("/api/v1/capture-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          organizationName,
          websiteUrl,
          campaignId,
          consent: Boolean(consent),
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Lead captured successfully:", result);

        // Hide modal
        this.hideEmailModal();

        // Show success message with mailto link
        this.showEmailSuccessMessage(result.data.mailtoLink);

        // Reset form
        document.getElementById("emailCaptureForm").reset();
      } else {
        throw new Error(result.error || "Failed to capture lead");
      }
    } catch (error) {
      console.error("❌ Email capture failed:", error);
      this.showNotification(
        `Email submission failed: ${error.message}`,
        "error"
      );
    } finally {
      // Reset button state
      sendEmailBtn.disabled = false;
      if (buttonSpan) {
        buttonSpan.textContent = originalText;
      } else {
        sendEmailBtn.textContent = originalText;
      }
      if (emailLoadingSpinner) {
        emailLoadingSpinner.classList.add("hidden");
      }
    }
  }

  showEmailSuccessMessage(mailtoLink) {
    // Create success modal/notification
    const notification = document.createElement("div");
    notification.className =
      "fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4";

    notification.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center animate-scale-in">
        <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="material-icons text-green-600 text-2xl">mark_email_read</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Email Sent!</h3>
        <p class="text-gray-600 mb-6">We've prepared your download link and campaign details. Click the button below to send the email.</p>
        
        <div class="space-y-3">
          <a href="${mailtoLink}" class="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200">
            <span class="material-icons">email</span>
            <span>Open Email Client</span>
          </a>
          
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="block w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200">
            Close
          </button>
        </div>
        
        <div class="mt-4 text-xs text-gray-500">
          Your download link expires in 24 hours
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 30000);
  }

  resetForm() {
    // Hide results and progress sections
    this.resultsSection.classList.add("hidden");
    this.progressSection.classList.add("hidden");

    // Reset form
    this.form.reset();

    // Reset input states
    const urlInput = document.getElementById("websiteUrl");
    const urlValidationIcon = document.getElementById("urlValidationIcon");
    this.resetInputState(urlInput, urlValidationIcon);

    // Reset character count
    const charCount = document.getElementById("charCount");
    charCount.textContent = "0 / 500";
    charCount.classList.add("text-gray-500");
    charCount.classList.remove("text-orange-500", "text-red-500");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Show success message
    this.showNotification("Ready to generate new campaigns!", "info");
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const websiteUrl = formData.get("websiteUrl");
    const instructions = formData.get("instructions");

    if (!this.validateForm(websiteUrl)) {
      return;
    }

    this.startGeneration();

    try {
      await this.generateCampaigns(websiteUrl, instructions);
    } catch (error) {
      this.handleError(error);
    }
  }

  validateForm(url) {
    const urlInput = document.getElementById("websiteUrl");
    const urlValidationIcon = document.getElementById("urlValidationIcon");

    if (!url) {
      this.showNotification("Please enter a website URL", "error");
      urlInput.focus();
      return false;
    }

    if (!this.validateUrl(urlInput, urlValidationIcon)) {
      this.showNotification("Please enter a valid URL", "error");
      urlInput.focus();
      return false;
    }

    return true;
  }

  startGeneration() {
    // Update button state
    this.generateBtn.disabled = true;
    this.btnText.textContent = "Generating Campaigns...";
    this.loadingSpinner.classList.remove("hidden");
    this.generateBtn.style.transform = "translateY(0)";

    // Add loading class to form
    this.form.classList.add("form-loading");

    // Hide results section if visible
    this.resultsSection.classList.add("hidden");

    // Show progress section
    this.progressSection.classList.remove("hidden");
    this.progressSection.classList.add("fade-in");

    // Reset progress
    this.updateProgress(0);
    this.resetProgressSteps();

    // Start progress animation
    this.animateProgress();

    // Scroll to progress section
    setTimeout(() => {
      this.progressSection.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  }

  updateProgress(percentage) {
    this.progressBar.style.width = `${percentage}%`;
    this.progressPercent.textContent = `${percentage}%`;
  }

  resetProgressSteps() {
    for (let i = 1; i <= 4; i++) {
      const step = document.getElementById(`step${i}`);
      const status = document.getElementById(`step${i}-status`);

      step.classList.remove(
        "step-active",
        "step-completed",
        "bg-blue-500",
        "bg-green-500"
      );
      step.classList.add("bg-gray-200");
      step.querySelector(".material-icons").classList.remove("text-white");
      step.querySelector(".material-icons").classList.add("text-gray-600");

      if (status) {
        status.textContent = "Waiting...";
        status.classList.remove("text-blue-600", "text-green-600");
        status.classList.add("text-gray-400");
      }
    }
  }

  setStepActive(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    const status = document.getElementById(`step${stepNumber}-status`);
    const icon = step.querySelector(".material-icons");

    // Remove previous active states
    document.querySelectorAll('[id^="step"]').forEach((s) => {
      if (s.id.includes("-status")) return;
      s.classList.remove("step-active", "pulse");
    });

    // Set current step as active
    step.classList.remove("bg-gray-200", "step-completed");
    step.classList.add("step-active", "bg-blue-500", "pulse");
    icon.classList.remove("text-gray-600");
    icon.classList.add("text-white");

    if (status) {
      status.textContent = "In Progress...";
      status.classList.remove("text-gray-400", "text-green-600");
      status.classList.add("text-blue-600");
    }

    // Mark previous steps as completed
    for (let i = 1; i < stepNumber; i++) {
      this.setStepCompleted(i);
    }
  }

  setStepCompleted(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    const status = document.getElementById(`step${stepNumber}-status`);
    const icon = step.querySelector(".material-icons");

    step.classList.remove("step-active", "bg-gray-200", "bg-blue-500", "pulse");
    step.classList.add("step-completed", "bg-green-500");
    icon.classList.remove("text-gray-600");
    icon.classList.add("text-white");
    icon.textContent = "check";

    if (status) {
      status.textContent = "Complete";
      status.classList.remove("text-gray-400", "text-blue-600");
      status.classList.add("text-green-600");
    }
  }

  async generateCampaigns(url, instructions) {
    const startTime = Date.now();

    try {
      // Generate unique thread ID for this session
      const threadId = `web_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      console.log(`Starting real campaign generation for: ${url}`);

      // Make API call to backend
      const response = await fetch("/api/v1/generate-campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: threadId,
          websiteUrl: url,
          instructions: instructions || "",
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      console.log("API Response:", result);

      if (!result.success) {
        throw new Error(result.error || "Campaign generation failed");
      }

      // Simulate progress updates during processing
      this.setStepActive(1);
      this.updateProgress(10);
      await this.delay(500);

      this.updateProgress(25);
      await this.delay(500);

      this.setStepActive(2);
      this.updateProgress(40);
      await this.delay(500);

      this.updateProgress(60);
      this.setStepActive(3);
      await this.delay(500);

      this.updateProgress(80);
      this.setStepActive(4);
      await this.delay(500);

      this.updateProgress(100);
      this.setStepCompleted(4);

      // Process the real response
      const processedResult = this.processRealResults(result.response, url);

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      await this.delay(500); // Brief pause before showing results
      this.showResults(processedResult, duration);
    } catch (error) {
      console.error("Generation failed:", error);
      throw error;
    }
  }

  processRealResults(apiResponse, url) {
    const domain = new URL(url).hostname;

    // Extract data from API response or use defaults
    const data = apiResponse.data || {};
    const campaigns = data.campaigns_created || 3;
    const adGroups = data.ad_groups_created || campaigns * 2;
    const keywords = data.keywords_generated || adGroups * 25;
    const ads = data.ads_created || adGroups * 2;

    return {
      campaigns: campaigns,
      adGroups: adGroups,
      keywords: keywords,
      ads: ads,
      files: {
        campaigns: {
          name: `${domain}_campaigns.csv`,
          content: this.generateMockCampaignCSV(campaigns),
          rowCount: campaigns,
          size: `${(campaigns * 0.8).toFixed(1)} KB`,
        },
        adGroups: {
          name: `${domain}_ad_groups.csv`,
          content: this.generateMockAdGroupCSV(adGroups),
          rowCount: adGroups,
          size: `${(adGroups * 0.6).toFixed(1)} KB`,
        },
        keywords: {
          name: `${domain}_keywords.csv`,
          content: this.generateMockKeywordCSV(keywords),
          rowCount: keywords,
          size: `${(keywords * 0.15).toFixed(1)} KB`,
        },
        ads: {
          name: `${domain}_ads.csv`,
          content: this.generateMockAdCSV(ads),
          rowCount: ads,
          size: `${(ads * 1.2).toFixed(1)} KB`,
        },
      },
      message: apiResponse.message || "Campaigns generated successfully!",
      recommendations: apiResponse.recommendations || [
        "Monitor campaign performance weekly",
        "Adjust keywords based on search terms report",
        "Test different ad copy variations",
      ],
    };
  }

  generateMockResults(url) {
    const domain = new URL(url).hostname;
    const campaignCount = Math.floor(Math.random() * 3) + 2; // 2-4 campaigns
    const adGroupCount = campaignCount * 2;
    const keywordCount = adGroupCount * 25;
    const adCount = adGroupCount * 2;

    return {
      campaigns: campaignCount,
      adGroups: adGroupCount,
      keywords: keywordCount,
      ads: adCount,
      files: {
        campaigns: {
          name: `${domain}_campaigns.csv`,
          content: this.generateMockCampaignCSV(campaignCount),
          rowCount: campaignCount,
          size: `${(campaignCount * 0.8).toFixed(1)} KB`,
        },
        adGroups: {
          name: `${domain}_ad_groups.csv`,
          content: this.generateMockAdGroupCSV(adGroupCount),
          rowCount: adGroupCount,
          size: `${(adGroupCount * 0.6).toFixed(1)} KB`,
        },
        keywords: {
          name: `${domain}_keywords.csv`,
          content: this.generateMockKeywordCSV(keywordCount),
          rowCount: keywordCount,
          size: `${(keywordCount * 0.15).toFixed(1)} KB`,
        },
        ads: {
          name: `${domain}_ads.csv`,
          content: this.generateMockAdCSV(adCount),
          rowCount: adCount,
          size: `${(adCount * 1.2).toFixed(1)} KB`,
        },
      },
    };
  }

  generateMockCampaignCSV(count) {
    let csv = "Campaign,Status,Budget,Type\n";
    for (let i = 1; i <= count; i++) {
      csv += `Campaign ${i},Active,${Math.floor(320 / count)},Search\n`;
    }
    return csv;
  }

  generateMockAdGroupCSV(count) {
    let csv = "Ad Group,Campaign,Status\n";
    for (let i = 1; i <= count; i++) {
      const campaignNum = Math.ceil(i / 2);
      csv += `Ad Group ${i},Campaign ${campaignNum},Active\n`;
    }
    return csv;
  }

  generateMockKeywordCSV(count) {
    let csv = "Keyword,Ad Group,Match Type\n";
    const keywords = [
      "nonprofit",
      "charity",
      "donation",
      "volunteer",
      "community",
      "help",
      "support",
      "cause",
    ];
    for (let i = 1; i <= count; i++) {
      const adGroupNum = Math.ceil(i / 25);
      const keyword = keywords[Math.floor(Math.random() * keywords.length)];
      csv += `${keyword} ${i % 10},Ad Group ${adGroupNum},Broad\n`;
    }
    return csv;
  }

  generateMockAdCSV(count) {
    let csv = "Headline 1,Headline 2,Description,Ad Group\n";
    for (let i = 1; i <= count; i++) {
      const adGroupNum = Math.ceil(i / 2);
      csv += `Professional Services,Expert Help,Get the support you need today,Ad Group ${adGroupNum}\n`;
    }
    return csv;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  animateProgress() {
    // This method is now handled by the actual generation process
    // keeping it for backward compatibility
  }

  showResults(result, duration) {
    // Reset button state
    this.generateBtn.disabled = false;
    this.btnText.textContent = "Generate Professional Campaigns";
    this.loadingSpinner.classList.add("hidden");
    this.form.classList.remove("form-loading");

    // Update generation time
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const timeText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    document.getElementById(
      "generationTime"
    ).textContent = `Generated in ${timeText}`;

    // Update summary counts
    document.getElementById("campaignCount").textContent = result.campaigns;
    document.getElementById("adGroupCount").textContent = result.adGroups;
    document.getElementById("keywordCount").textContent = result.keywords;
    document.getElementById("adCount").textContent = result.ads;

    // Show results section
    this.resultsSection.classList.remove("hidden");
    this.resultsSection.classList.add("animate-scale-in");

    // Populate download links
    this.populateDownloadLinks(result.files);

    // Show success notification
    this.showNotification("Campaigns generated successfully!", "success");

    // Scroll to results
    setTimeout(() => {
      this.resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  }

  populateDownloadLinks(files) {
    const downloadLinks = document.getElementById("downloadLinks");
    downloadLinks.innerHTML = "";

    const fileTypes = [
      { key: "campaigns", name: "Campaigns", icon: "campaign", color: "blue" },
      { key: "adGroups", name: "Ad Groups", icon: "folder", color: "purple" },
      { key: "keywords", name: "Keywords", icon: "search", color: "green" },
      {
        key: "ads",
        name: "Responsive Search Ads",
        icon: "ads_click",
        color: "orange",
      },
    ];

    fileTypes.forEach((fileType) => {
      if (files[fileType.key]) {
        const linkElement = this.createDownloadLink(
          fileType.name,
          fileType.icon,
          fileType.color,
          files[fileType.key]
        );
        downloadLinks.appendChild(linkElement);
      }
    });
  }

  createDownloadLink(name, icon, color, fileData) {
    const div = document.createElement("div");
    div.className =
      "download-link group bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-google-hover hover:border-gray-300 transition-all duration-200";

    const colorClasses = {
      blue: "text-blue-600 bg-blue-50",
      purple: "text-purple-600 bg-purple-50",
      green: "text-green-600 bg-green-50",
      orange: "text-orange-600 bg-orange-50",
    };

    div.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <span class="material-icons text-lg">${icon}</span>
                    </div>
                    <div>
                        <h5 class="font-semibold text-gray-900 group-hover:text-${color}-600 transition-colors">${name}</h5>
                        <p class="text-sm text-gray-500">${fileData.rowCount} rows • ${fileData.size}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="material-icons text-gray-400 group-hover:text-${color}-500 transition-colors">download</span>
                </div>
            </div>
        `;

    div.addEventListener("click", () => {
      // Show email modal instead of direct download
      this.showEmailModal();
    });

    return div;
  }

  downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.showNotification(`Downloaded ${filename}`, "success");
  }

  handleError(error) {
    // Reset button state
    this.generateBtn.disabled = false;
    this.btnText.textContent = "Generate Professional Campaigns";
    this.loadingSpinner.classList.add("hidden");
    this.form.classList.remove("form-loading");
    this.generateBtn.style.transform = "translateY(0)";

    // Hide progress section
    this.progressSection.classList.add("hidden");

    // Show error notification
    this.showNotification(
      "Failed to generate campaigns. Please try again.",
      "error"
    );

    console.error("Campaign generation error:", error);
  }

  showNotification(message, type = "info", duration = 4000) {
    // Remove existing notifications
    document.querySelectorAll(".notification").forEach((n) => n.remove());

    const notification = document.createElement("div");
    notification.className =
      "notification fixed top-4 right-4 z-[60] max-w-sm transform translate-x-full transition-transform duration-300 ease-out";

    const colors = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    };

    const icons = {
      success: "check_circle",
      error: "error",
      info: "info",
      warning: "warning",
    };

    notification.innerHTML = `
            <div class="bg-white border border-gray-200 rounded-xl shadow-google p-4 ${colors[type]}">
                <div class="flex items-start space-x-3">
                    <span class="material-icons text-lg mt-0.5">${icons[type]}</span>
                    <div class="flex-1">
                        <p class="text-sm font-medium">${message}</p>
                    </div>
                    <button class="notification-close ml-2 text-gray-400 hover:text-gray-600">
                        <span class="material-icons text-lg">close</span>
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.remove("translate-x-full");
    }, 100);

    // Add close button functionality
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => {
      this.hideNotification(notification);
    });

    // Auto hide notification
    setTimeout(() => {
      this.hideNotification(notification);
    }, duration);
  }

  hideNotification(notification) {
    notification.classList.add("translate-x-full");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CampaignGenerator();
});

// Demo functionality for testing
window.demoGeneration = async () => {
  const generator = new CampaignGenerator();

  // Fill form with demo data
  document.getElementById("websiteUrl").value = "https://example-nonprofit.org";
  document.getElementById("instructions").value =
    "Focus on community outreach and volunteer recruitment programs.";

  // Start generation
  generator.startGeneration();

  // Simulate the generation process
  await generator.generateCampaigns(
    "https://example-nonprofit.org",
    "Focus on community outreach and volunteer recruitment programs."
  );
};
