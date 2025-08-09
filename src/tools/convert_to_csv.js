import { tool } from "@langchain/core/tools";
import fs from "fs";
import path from "path";

export const convertToCSV = tool(
  async (input) => {
    try {
      const {
        campaignData,
        customerId,
        baseFilename = `google_ads_campaign_${Date.now()}`,
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

      if (!customerId) {
        throw new Error("Customer ID is required for Google Ads Editor import");
      }

      // Initialize the CSV files data
      const csvFiles = {};

      // Generate unique IDs for campaigns and ad groups
      let campaignIdCounter = 100000;
      let adGroupIdCounter = 200000;
      let keywordIdCounter = 300000;
      let adIdCounter = 400000;

      // Helper function to escape CSV values
      const escapeCSV = (value) => {
        if (!value) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // CAMPAIGNS CSV
      let campaignsCSV = [
        "Row Type,Action,Campaign status,Campaign ID,Campaign,Campaign type,Networks,Budget,Delivery method,Budget type,Bid strategy type,Bid strategy,Campaign start date,Campaign end date,Language,Location,Exclusion,Devices,Label,Target CPA,Target ROAS,Display URL option,Website description,Target Impression Share,Max CPC Bid Limit for Target IS,Location Goal for Target IS,Tracking template,Final URL suffix,Custom parameter,Inventory type,Campaign subtype,Video ad formats",
      ];

      // AD GROUPS CSV
      let adGroupsCSV = [
        "Row Type,Action,Ad group status,Campaign ID,Campaign,Ad group ID,Ad group,Ad group type,Ad rotation,Default max. CPC,CPC%,Max. CPM,Max. CPV,Target CPA,Target CPM,Target CPV,Label,Tracking template,Final URL suffix,Custom parameter,Target ROAS",
      ];

      // KEYWORDS CSV
      let keywordsCSV = [
        "Row Type,Action,Keyword status,Campaign ID,Campaign,Ad group ID,Ad group,Keyword ID,Keyword,Type,Label,Default max. CPC,Max. CPV,Final URL,Mobile final URL,Final URL suffix,Tracking template,Custom parameter",
      ];

      // RESPONSIVE SEARCH ADS CSV
      let adsCSV = [
        "Row Type,Action,Ad status,Campaign ID,Campaign,Ad group ID,Ad group,Ad ID,Ad type,Label,Headline 1,Headline 2,Headline 3,Headline 4,Headline 5,Headline 6,Headline 7,Headline 8,Headline 9,Headline 10,Headline 11,Headline 12,Headline 13,Headline 14,Headline 15,Description 1,Description 2,Description 3,Description 4,Headline 1 position,Headline 2 position,Headline 3 position,Headline 4 position,Headline 5 position,Headline 6 position,Headline 7 position,Headline 8 position,Headline 9 position,Headline 10 position,Headline 11 position,Headline 12 position,Headline 13 position,Headline 14 position,Headline 15 position,Description 1 position,Description 2 position,Description 3 position,Description 4 position,Path 1,Path 2,Final URL,Mobile final URL,Tracking template,Final URL suffix,Custom parameter",
      ];

      // Process each campaign
      campaignData.campaigns.forEach((campaign, campaignIndex) => {
        const campaignId = campaignIdCounter++;
        const dailyBudget =
          campaign.budget || 320 / campaignData.campaigns.length; // Distribute $320 across campaigns

        // Get final URL from campaign or use default
        const finalUrl =
          campaign.finalUrl ||
          campaign.url ||
          campaignData.websiteUrl ||
          "https://example.org";

        // Campaign row
        const campaignRow = [
          "Campaign", // Row Type
          "Add", // Action
          "Enabled", // Campaign status
          campaignId, // Campaign ID
          escapeCSV(campaign.name), // Campaign
          "Search", // Campaign type
          "Google search", // Networks
          dailyBudget.toFixed(2), // Budget
          "Standard", // Delivery method
          "Daily", // Budget type
          "Target CPA", // Bid strategy type
          "", // Bid strategy (empty for manual)
          "", // Campaign start date (empty = immediate)
          "", // Campaign end date (empty = no end)
          "en", // Language
          campaign.location || "United States", // Location
          "", // Exclusion
          "", // Devices
          "", // Label
          "50.00", // Target CPA ($50 for Ad Grants)
          "", // Target ROAS
          "", // Display URL option
          "", // Website description
          "", // Target Impression Share
          "", // Max CPC Bid Limit for Target IS
          "", // Location Goal for Target IS
          "", // Tracking template
          "", // Final URL suffix
          "", // Custom parameter
          "", // Inventory type
          "", // Campaign subtype
          "", // Video ad formats
        ];
        campaignsCSV.push(campaignRow.join(","));

        // Process ad groups
        if (campaign.adGroups && campaign.adGroups.length > 0) {
          campaign.adGroups.forEach((adGroup, adGroupIndex) => {
            const adGroupId = adGroupIdCounter++;

            // Ad Group row
            const adGroupRow = [
              "Ad group", // Row Type
              "Add", // Action
              "Enabled", // Ad group status
              campaignId, // Campaign ID
              escapeCSV(campaign.name), // Campaign
              adGroupId, // Ad group ID
              escapeCSV(adGroup.name), // Ad group
              "Standard", // Ad group type
              "Optimize", // Ad rotation
              "2.00", // Default max. CPC ($2 for Ad Grants)
              "", // CPC%
              "", // Max. CPM
              "", // Max. CPV
              "", // Target CPA
              "", // Target CPM
              "", // Target CPV
              "", // Label
              "", // Tracking template
              "", // Final URL suffix
              "", // Custom parameter
              "", // Target ROAS
            ];
            adGroupsCSV.push(adGroupRow.join(","));

            // Process keywords
            if (adGroup.keywords && adGroup.keywords.length > 0) {
              adGroup.keywords.forEach((keyword, keywordIndex) => {
                const keywordId = keywordIdCounter++;

                const keywordRow = [
                  "Keyword", // Row Type
                  "Add", // Action
                  "Enabled", // Keyword status
                  campaignId, // Campaign ID
                  escapeCSV(campaign.name), // Campaign
                  adGroupId, // Ad group ID
                  escapeCSV(adGroup.name), // Ad group
                  keywordId, // Keyword ID
                  escapeCSV(keyword), // Keyword
                  "Broad match", // Type
                  "", // Label
                  "2.00", // Default max. CPC
                  "", // Max. CPV
                  finalUrl, // Final URL
                  "", // Mobile final URL
                  "", // Final URL suffix
                  "", // Tracking template
                  "", // Custom parameter
                ];
                keywordsCSV.push(keywordRow.join(","));
              });
            }

            // Process responsive search ads
            if (adGroup.ads && adGroup.ads.length > 0) {
              adGroup.ads.forEach((ad, adIndex) => {
                if (ad.type === "responsive_search_ad") {
                  const adId = adIdCounter++;

                  // Ensure we have at least 3 headlines and 2 descriptions
                  const headlines = ad.headlines || [];
                  const descriptions = ad.descriptions || [];

                  // Pad with empty values up to 15 headlines
                  while (headlines.length < 15) headlines.push("");
                  // Pad with empty values up to 4 descriptions
                  while (descriptions.length < 4) descriptions.push("");

                  const adRow = [
                    "Ad", // Row Type
                    "Add", // Action
                    "Enabled", // Ad status
                    campaignId, // Campaign ID
                    escapeCSV(campaign.name), // Campaign
                    adGroupId, // Ad group ID
                    escapeCSV(adGroup.name), // Ad group
                    adId, // Ad ID
                    "Responsive search ad", // Ad type
                    "", // Label
                    // Headlines 1-15
                    ...headlines.slice(0, 15).map((h) => escapeCSV(h)),
                    // Descriptions 1-4
                    ...descriptions.slice(0, 4).map((d) => escapeCSV(d)),
                    // Headline positions (empty for auto-optimization)
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    // Description positions (empty for auto-optimization)
                    "",
                    "",
                    "",
                    "",
                    "", // Path 1
                    "", // Path 2
                    finalUrl, // Final URL
                    "", // Mobile final URL
                    "", // Tracking template
                    "", // Final URL suffix
                    "", // Custom parameter
                  ];
                  adsCSV.push(adRow.join(","));
                }
              });
            }
          });
        }
      });

      // Create the CSV files object
      csvFiles.campaigns = campaignsCSV.join("\n");
      csvFiles.adGroups = adGroupsCSV.join("\n");
      csvFiles.keywords = keywordsCSV.join("\n");
      csvFiles.ads = adsCSV.join("\n");

      // Save to files if requested
      const filePaths = {};
      if (saveToFile) {
        const exportsDir = path.join(process.cwd(), "exports");
        if (!fs.existsSync(exportsDir)) {
          fs.mkdirSync(exportsDir, { recursive: true });
        }

        // Save each CSV file
        const fileNames = {
          campaigns: `${baseFilename}_campaigns.csv`,
          adGroups: `${baseFilename}_ad_groups.csv`,
          keywords: `${baseFilename}_keywords.csv`,
          ads: `${baseFilename}_responsive_search_ads.csv`,
        };

        Object.keys(csvFiles).forEach((type) => {
          const filePath = path.join(exportsDir, fileNames[type]);
          fs.writeFileSync(filePath, csvFiles[type], "utf8");
          filePaths[type] = {
            filename: fileNames[type],
            path: filePath,
          };
        });
      }

      // Calculate summary statistics
      const summary = {
        totalCampaigns: campaignData.campaigns.length,
        totalAdGroups: campaignData.campaigns.reduce(
          (sum, c) => sum + (c.adGroups ? c.adGroups.length : 0),
          0
        ),
        totalKeywords: campaignData.campaigns.reduce(
          (sum, c) =>
            sum +
            (c.adGroups
              ? c.adGroups.reduce(
                  (agSum, ag) => agSum + (ag.keywords ? ag.keywords.length : 0),
                  0
                )
              : 0),
          0
        ),
        totalAds: campaignData.campaigns.reduce(
          (sum, c) =>
            sum +
            (c.adGroups
              ? c.adGroups.reduce(
                  (agSum, ag) => agSum + (ag.ads ? ag.ads.length : 0),
                  0
                )
              : 0),
          0
        ),
        customerId: customerId,
        budgetDistribution: `$${(320 / campaignData.campaigns.length).toFixed(
          2
        )} per campaign`,
      };

      return {
        success: true,
        message: `Google Ads Editor CSV files created successfully`,
        files: filePaths,
        csvData: saveToFile ? null : csvFiles,
        summary: summary,
        instructions: {
          uploadOrder: [
            "1. Import campaigns CSV first",
            "2. Import ad groups CSV second",
            "3. Import keywords CSV third",
            "4. Import responsive search ads CSV last",
          ],
          notes: [
            "All files are formatted for Google Ads Editor",
            "CPA bidding strategy set to $50 (Ad Grant compliant)",
            "Default max CPC set to $2.00 (Ad Grant compliant)",
            "Broad match keywords for maximum reach",
            "Campaign budgets distributed evenly across campaigns",
          ],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to generate Google Ads Editor CSV files",
      };
    }
  },
  {
    name: "convert_to_csv",
    description:
      "Convert campaign data to Google Ads Editor compatible CSV files. Creates separate properly formatted CSV files for campaigns, ad groups, keywords, and responsive search ads that can be imported directly into Google Ads Editor.",
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
                    description:
                      "Daily budget amount (will be distributed from $320 total if not specified)",
                  },
                  location: {
                    type: "string",
                    description:
                      "Geographic targeting location (defaults to 'United States')",
                  },
                  finalUrl: {
                    type: "string",
                    description: "Landing page URL for the campaign",
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
                          description:
                            "List of keywords (will be set as broad match)",
                        },
                        ads: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              type: {
                                type: "string",
                                description:
                                  "Ad type (should be 'responsive_search_ad')",
                              },
                              headlines: {
                                type: "array",
                                items: { type: "string" },
                                description:
                                  "RSA headlines (minimum 3, up to 15 recommended)",
                              },
                              descriptions: {
                                type: "array",
                                items: { type: "string" },
                                description:
                                  "RSA descriptions (minimum 2, up to 4 recommended)",
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            websiteUrl: {
              type: "string",
              description:
                "Default website URL to use for final URLs if not specified per campaign",
            },
          },
          required: ["campaigns"],
        },
        customerId: {
          type: "string",
          description:
            "Google Ads Customer ID (format: XXX-XXX-XXXX) - required for Google Ads Editor import",
          required: true,
        },
        baseFilename: {
          type: "string",
          description:
            "Base filename for the CSV files (default: auto-generated timestamp). Will create separate files with suffixes.",
          default: null,
        },
        saveToFile: {
          type: "boolean",
          description:
            "Whether to save CSV files or just return content (default: true)",
          default: true,
        },
      },
      required: ["campaignData", "customerId"],
    },
  }
);
