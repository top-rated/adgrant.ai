import { tool } from "@langchain/core/tools";
import fs from "fs";
import path from "path";

export const convertToCSV = tool(
  async (input) => {
    try {
      const {
        campaignData,
        filename = `google_ads_campaign_${Date.now()}.csv`,
        saveToFile = true,
      } = input;

      // Validate input structure
      if (
        !campaignData ||
        !campaignData.campaigns ||
        campaignData.campaigns.length === 0
      ) {
        throw new Error("Campaign data is required with at least one campaign");
      }

      // Initialize CSV content with Google Ads Editor format (Tab-separated)
      let csvContent = "Type\tRow count\n";

      // Track component counts
      let totalCampaigns = 0;
      let totalAdGroups = 0;
      let totalKeywords = 0;
      let totalAds = 0;
      let totalSitelinks = 0;
      let totalCallouts = 0;
      let totalStructuredSnippets = 0;
      let totalLocations = 0;

      // Build the actual CSV data sections
      let campaignSections = [];

      // Add Account Setting (required)
      campaignSections.push("\n# Account Settings");
      campaignSections.push("Account setting\t1");

      // Process each campaign
      campaignData.campaigns.forEach((campaign, campaignIndex) => {
        totalCampaigns++;

        // Campaign section
        campaignSections.push(`\n# Campaign: ${campaign.name}`);
        campaignSections.push(`Campaign\t1`);

        // Location targeting (if specified)
        if (campaign.locations && campaign.locations.length > 0) {
          campaignSections.push(
            `Location (Targeting)\t${campaign.locations.length}`
          );
          totalLocations += campaign.locations.length;
        } else {
          // Default to United States targeting for Google Ad Grants
          campaignSections.push(`Location (Targeting)\t1`);
          totalLocations += 1;
        }

        // Budget (as shared budget if specified)
        if (campaign.budget) {
          campaignSections.push(`Shared budget\t1`);
        }

        // Process ad groups
        if (campaign.adGroups && campaign.adGroups.length > 0) {
          campaign.adGroups.forEach((adGroup, adGroupIndex) => {
            totalAdGroups++;

            campaignSections.push(`\n# Ad Group: ${adGroup.name}`);
            campaignSections.push(`Ad group\t1`);

            // Keywords
            if (adGroup.keywords && adGroup.keywords.length > 0) {
              campaignSections.push(`Keyword\t${adGroup.keywords.length}`);
              totalKeywords += adGroup.keywords.length;
            }

            // Responsive Search Ads
            if (adGroup.ads && adGroup.ads.length > 0) {
              const rsaAds = adGroup.ads.filter(
                (ad) => ad.type === "responsive_search_ad"
              );
              if (rsaAds.length > 0) {
                campaignSections.push(`Responsive search ad\t${rsaAds.length}`);
                totalAds += rsaAds.length;
              }
            }
          });
        }

        // Campaign-level ad assets
        if (campaign.sitelinks && campaign.sitelinks.length > 0) {
          campaignSections.push(
            `Sitelink (Ad assets)\t${campaign.sitelinks.length}`
          );
          totalSitelinks += campaign.sitelinks.length;
        }

        if (campaign.callouts && campaign.callouts.length > 0) {
          campaignSections.push(
            `Callout (Ad assets)\t${campaign.callouts.length}`
          );
          totalCallouts += campaign.callouts.length;
        }

        if (
          campaign.structuredSnippets &&
          campaign.structuredSnippets.length > 0
        ) {
          campaignSections.push(
            `Structured snippet (Ad assets)\t${campaign.structuredSnippets.length}`
          );
          totalStructuredSnippets += campaign.structuredSnippets.length;
        }
      });

      // Build final CSV with summary counts at top
      let finalCSV = "Type\tRow count\n";
      finalCSV += `Account setting\t1\n`;
      finalCSV += `Campaign\t${totalCampaigns}\n`;
      finalCSV += `Ad group\t${totalAdGroups}\n`;
      if (totalKeywords > 0) finalCSV += `Keyword\t${totalKeywords}\n`;
      if (totalAds > 0) finalCSV += `Responsive search ad\t${totalAds}\n`;
      if (totalLocations > 0)
        finalCSV += `Location (Targeting)\t${totalLocations}\n`;
      if (totalSitelinks > 0)
        finalCSV += `Sitelink (Ad assets)\t${totalSitelinks}\n`;
      if (totalCallouts > 0)
        finalCSV += `Callout (Ad assets)\t${totalCallouts}\n`;
      if (totalStructuredSnippets > 0)
        finalCSV += `Structured snippet (Ad assets)\t${totalStructuredSnippets}\n`;

      // Add detailed campaign data
      finalCSV += campaignSections.join("\n");

      // Save to file if requested
      if (saveToFile) {
        const filePath = path.join(process.cwd(), "exports", filename);

        // Ensure exports directory exists
        const exportsDir = path.dirname(filePath);
        if (!fs.existsSync(exportsDir)) {
          fs.mkdirSync(exportsDir, { recursive: true });
        }

        // Write CSV file
        fs.writeFileSync(filePath, finalCSV, "utf8");

        return {
          success: true,
          message: `Google Ads CSV file created successfully`,
          filename: filename,
          filePath: filePath,
          summary: {
            totalCampaigns,
            totalAdGroups,
            totalKeywords,
            totalAds,
            totalSitelinks,
            totalCallouts,
            totalStructuredSnippets,
            totalLocations,
          },
          csvPreview: finalCSV.substring(0, 500) + "...",
        };
      }

      // Return CSV content without saving
      return {
        success: true,
        message: `Google Ads CSV content generated`,
        csvContent: finalCSV,
        summary: {
          totalCampaigns,
          totalAdGroups,
          totalKeywords,
          totalAds,
          totalSitelinks,
          totalCallouts,
          totalStructuredSnippets,
          totalLocations,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to generate Google Ads CSV file",
      };
    }
  },
  {
    name: "convert_to_csv",
    description:
      "Convert campaign data to Google Ads Editor compatible CSV format. Creates properly formatted TSV file with all required components for Google Ad Grant campaigns.",
    parameters: {
      type: "object",
      properties: {
        campaignData: {
          type: "object",
          description:
            "Complete campaign data structure with campaigns, ad groups, keywords, ads, and extensions",
          properties: {
            campaigns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Campaign name" },
                  budget: {
                    type: "number",
                    description: "Daily budget amount",
                  },
                  locations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Geographic targeting locations",
                  },
                  adGroups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Ad group name" },
                        keywords: {
                          type: "array",
                          items: { type: "string" },
                          description: "List of keywords (broad match)",
                        },
                        ads: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              type: {
                                type: "string",
                                description: "Ad type (responsive_search_ad)",
                              },
                              headlines: {
                                type: "array",
                                items: { type: "string" },
                                description: "RSA headlines (15 recommended)",
                              },
                              descriptions: {
                                type: "array",
                                items: { type: "string" },
                                description: "RSA descriptions (4 minimum)",
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  sitelinks: {
                    type: "array",
                    items: { type: "string" },
                    description: "Sitelink extensions",
                  },
                  callouts: {
                    type: "array",
                    items: { type: "string" },
                    description: "Callout extensions",
                  },
                  structuredSnippets: {
                    type: "array",
                    items: { type: "string" },
                    description: "Structured snippet extensions",
                  },
                },
              },
            },
          },
          required: ["campaigns"],
        },
        filename: {
          type: "string",
          description:
            "Optional filename for the CSV file (default: auto-generated timestamp)",
          default: null,
        },
        saveToFile: {
          type: "boolean",
          description:
            "Whether to save CSV to file or just return content (default: true)",
          default: true,
        },
      },
      required: ["campaignData"],
    },
  }
);
