import fs from "fs";
import path from "path";

/**
 * Simple lead management system with file-based storage
 */
export class LeadManager {
  constructor() {
    this.leadsFile = path.join(process.cwd(), "data", "leads.json");
    this.ensureDataDirectory();
  }

  /**
   * Ensure the data directory exists
   */
  ensureDataDirectory() {
    const dataDir = path.dirname(this.leadsFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  /**
   * Load leads from file
   */
  loadLeads() {
    try {
      if (fs.existsSync(this.leadsFile)) {
        const data = fs.readFileSync(this.leadsFile, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading leads:", error);
    }
    return [];
  }

  /**
   * Save leads to file
   */
  saveLeads(leads) {
    try {
      fs.writeFileSync(this.leadsFile, JSON.stringify(leads, null, 2));
      return true;
    } catch (error) {
      console.error("Error saving leads:", error);
      return false;
    }
  }

  /**
   * Add a new lead
   */
  addLead(leadData) {
    const leads = this.loadLeads();

    const lead = {
      id: this.generateId(),
      email: leadData.email,
      organizationName: leadData.organizationName || null,
      websiteUrl: leadData.websiteUrl || null,
      campaignId: leadData.campaignId || null,
      consent: leadData.consent || false,
      createdAt: new Date().toISOString(),
      downloadCount: 0,
      lastDownload: null,
      ipAddress: leadData.ipAddress || null,
      userAgent: leadData.userAgent || null,
    };

    leads.push(lead);

    if (this.saveLeads(leads)) {
      console.log(
        `📧 New lead captured: ${lead.email} (${
          lead.organizationName || "No org"
        })`
      );
      return lead;
    }

    return null;
  }

  /**
   * Find lead by email
   */
  findByEmail(email) {
    const leads = this.loadLeads();
    return leads.find(
      (lead) => lead.email.toLowerCase() === email.toLowerCase()
    );
  }

  /**
   * Find lead by ID
   */
  findById(id) {
    const leads = this.loadLeads();
    return leads.find((lead) => lead.id === id);
  }

  /**
   * Update download count for a lead
   */
  recordDownload(leadId) {
    const leads = this.loadLeads();
    const leadIndex = leads.findIndex((lead) => lead.id === leadId);

    if (leadIndex !== -1) {
      leads[leadIndex].downloadCount += 1;
      leads[leadIndex].lastDownload = new Date().toISOString();
      this.saveLeads(leads);
      return leads[leadIndex];
    }

    return null;
  }

  /**
   * Get lead statistics
   */
  getStats() {
    const leads = this.loadLeads();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      total: leads.length,
      today: leads.filter((lead) => new Date(lead.createdAt) >= today).length,
      thisWeek: leads.filter((lead) => new Date(lead.createdAt) >= thisWeek)
        .length,
      thisMonth: leads.filter((lead) => new Date(lead.createdAt) >= thisMonth)
        .length,
      totalDownloads: leads.reduce((sum, lead) => sum + lead.downloadCount, 0),
      conversionRate:
        leads.length > 0
          ? (
              (leads.filter((lead) => lead.downloadCount > 0).length /
                leads.length) *
              100
            ).toFixed(1) + "%"
          : "0%",
    };

    return stats;
  }

  /**
   * Generate unique ID for lead
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Generate secure download token
   */
  generateDownloadToken(leadId, campaignId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2);
    return `${leadId}_${campaignId}_${timestamp}_${random}`;
  }

  /**
   * Validate download token
   */
  validateDownloadToken(token) {
    try {
      const parts = token.split("_");
      if (parts.length !== 4) return null;

      const [leadId, campaignId, timestamp, random] = parts;
      const tokenAge = Date.now() - parseInt(timestamp);

      // Token expires after 24 hours
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return null;
      }

      return { leadId, campaignId, timestamp: parseInt(timestamp) };
    } catch (error) {
      console.error("Error validating download token:", error);
      return null;
    }
  }

  /**
   * Clean up old leads (optional maintenance)
   */
  cleanupOldLeads(daysOld = 365) {
    const leads = this.loadLeads();
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const activeleads = leads.filter(
      (lead) => new Date(lead.createdAt) > cutoff
    );
    const removedCount = leads.length - activeleads.length;

    if (removedCount > 0) {
      this.saveLeads(activeleads);
      console.log(`🧹 Cleaned up ${removedCount} old leads`);
    }

    return removedCount;
  }
}

// Export singleton instance
export const leadManager = new LeadManager();
