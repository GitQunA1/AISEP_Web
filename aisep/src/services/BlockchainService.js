/**
 * BlockchainService.js
 * Handles blockchain integration for IP protection and document verification
 * Implements: BR-08 (IP protection), BR-21 (proof display), BR-24-26 (verification)
 */

import { PROJECT_STATUS } from '../constants/ProjectStatus';

class BlockchainService {
  /**
   * Generate hash for document (simulated)
   * In production, this would use actual crypto functions
   * @param {File} file - Document file
   * @returns {Promise<string>} - Document hash
   */
  static async generateDocumentHash(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Simulate SHA-256 hash (in production use crypto library)
        const content = event.target.result;
        const hash = this._simpleHash(content);
        resolve(hash);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * BR-08: Protect documents on blockchain
   * Records hash of documents and confirms IP protection
   * @param {File[]} documents - Array of document files
   * @param {string} projectId - Project ID
   * @returns {Promise<object>} - { success, blockchainHash, transactionHash, timestamp, status }
   */
  static async protectDocumentsOnBlockchain(documents, projectId) {
    if (!documents || documents.length === 0) {
      return {
        success: false,
        error: 'No documents provided for blockchain protection',
        blockchainHash: null,
        transactionHash: null,
        timestamp: null,
        status: 'FAILED'
      };
    }

    try {
      // Simulate blockchain call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate combined hash from all documents
      const hashes = await Promise.all(
        documents.map(doc => this.generateDocumentHash(doc))
      );
      const combinedHash = hashes.join('|');
      const blockchainHash = this._simpleHash(combinedHash);

      // Simulate blockchain response
      const transactionHash = this._generateTransactionHash();
      const timestamp = new Date().toISOString();

      // In production, this would be actual blockchain transaction
      console.log(`[BLOCKCHAIN] IP Protection recorded:`, {
        projectId,
        blockchainHash,
        transactionHash,
        timestamp,
        documentCount: documents.length
      });

      return {
        success: true,
        blockchainHash,
        transactionHash,
        timestamp,
        status: 'SUCCESS',
        verificationStatus: 'Verified',
        documentsCount: documents.length
      };
    } catch (error) {
      console.error('[BLOCKCHAIN] Protection failed:', error);
      return {
        success: false,
        error: error.message,
        blockchainHash: null,
        transactionHash: null,
        timestamp: null,
        status: 'FAILED'
      };
    }
  }

  /**
   * BR-24: Verify document hash against blockchain record
   * Compares current document hash with stored blockchain hash
   * @param {File} currentDocument - Current document file
   * @param {string} storedBlockchainHash - Hash stored on blockchain
   * @returns {Promise<object>} - { verified: boolean, currentHash, storedHash, message }
   */
  static async verifyDocumentHash(currentDocument, storedBlockchainHash) {
    if (!currentDocument || !storedBlockchainHash) {
      return {
        verified: false,
        currentHash: null,
        storedHash: storedBlockchainHash,
        message: 'Missing document or blockchain hash',
        status: 'ERROR'
      };
    }

    try {
      const currentHash = await this.generateDocumentHash(currentDocument);

      // Simulate blockchain verification call
      await new Promise(resolve => setTimeout(resolve, 800));

      const verified = currentHash === storedBlockchainHash;

      return {
        verified,
        currentHash,
        storedHash: storedBlockchainHash,
        message: verified 
          ? 'Document verified on blockchain' 
          : 'Document hash mismatch - document may have been modified',
        status: verified ? 'VERIFIED' : 'MISMATCH'
      };
    } catch (error) {
      console.error('[BLOCKCHAIN] Verification failed:', error);
      return {
        verified: false,
        currentHash: null,
        storedHash: storedBlockchainHash,
        message: error.message,
        status: 'ERROR'
      };
    }
  }

  /**
   * BR-21: Get blockchain proof for display
   * Returns proof information for public display
   * @param {object} project - Project object with blockchain data
   * @returns {object} - { transactionHash, timestamp, verificationStatus, blockchainLink }
   */
  static getBlockchainProof(project) {
    if (!project.blockchainHash || !project.transactionHash) {
      return {
        available: false,
        transactionHash: null,
        timestamp: null,
        verificationStatus: null,
        blockchainLink: null,
        message: 'No blockchain proof available'
      };
    }

    const timestamp = project.ipProtectionDate || new Date().toISOString();
    const transactionHash = project.transactionHash;

    // Format timestamp for display
    const formattedTimestamp = new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC'
    }) + ' UTC';

    // Generate blockchain explorer link (simulated)
    const blockchainLink = `https://blockchain.explorer/tx/${transactionHash}`;

    return {
      available: true,
      transactionHash,
      timestamp: formattedTimestamp,
      verificationStatus: 'Verified',
      blockchainLink,
      shortHash: transactionHash.substring(0, 16) + '...'
    };
  }

  /**
   * BR-25: Get verification badge info
   * Returns badge display information
   * @param {object} verificationResult - Result from verifyDocumentHash
   * @returns {object} - { show: boolean, type: string, message: string, color: string }
   */
  static getVerificationBadge(verificationResult) {
    if (!verificationResult) {
      return {
        show: false,
        type: null,
        message: null,
        color: null
      };
    }

    if (verificationResult.verified) {
      return {
        show: true,
        type: 'VERIFIED',
        message: 'Verified on Blockchain',
        color: '#10B981',
        icon: 'CheckCircle'
      };
    } else {
      return {
        show: true,
        type: 'MISMATCH',
        message: 'Document mismatch',
        color: '#EF4444',
        icon: 'AlertCircle'
      };
    }
  }

  /**
   * Check if project has IP protection (BR-08)
   * @param {object} project - Project object
   * @returns {boolean}
   */
  static hasIPProtection(project) {
    return !!(project.blockchainHash && project.transactionHash && project.ipProtectionDate);
  }

  /**
   * Check if project can proceed to publish (BR-09)
   * @param {object} project - Project object
   * @returns {object} - { canPublish: boolean, reason: string }
   */
  static checkPublishEligibility(project) {
    if (!this.hasIPProtection(project)) {
      return {
        canPublish: false,
        reason: 'Project must be protected on blockchain before publishing'
      };
    }

    return {
      canPublish: true,
      reason: ''
    };
  }

  /**
   * Helper: Simple hash function (for development/simulation)
   * In production, use crypto library (e.g., crypto-js, tweetnacl)
   * @param {*} data - Data to hash
   * @returns {string} - Hash string
   */
  static _simpleHash(data) {
    let hash = 0;
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    
    if (str.length === 0) return '0x0';
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const hashHex = Math.abs(hash).toString(16).padStart(64, '0');
    return '0x' + hashHex;
  }

  /**
   * Helper: Generate simulated transaction hash
   * @returns {string} - Transaction hash
   */
  static _generateTransactionHash() {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
  }

  /**
   * Helper: Format hash for display (short version)
   * @param {string} hash - Full hash
   * @returns {string} - Shortened hash
   */
  static formatHashForDisplay(hash) {
    if (!hash) return '';
    if (hash.length <= 16) return hash;
    return hash.substring(0, 10) + '...' + hash.substring(hash.length - 6);
  }
}

export default BlockchainService;
