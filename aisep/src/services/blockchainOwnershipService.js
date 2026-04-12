import { apiClient } from './apiClient';

/**
 * Service for blockchain ownership transfer verification
 * Handles polling and status checking after deal is signed
 */
const blockchainOwnershipService = {
    /**
     * Get blockchain ownership status for a deal
     * @param {number} dealId - The deal ID to check
     * @returns {Promise} API response with ownership transfer status
     */
    getBlockchainStatus: async (dealId) => {
        try {
            const response = await apiClient.get(`/api/Deals/${dealId}/ownership-status`);
            console.log(`[blockchainOwnershipService] Get ownership status for deal ${dealId}:`, response);
            return response;
        } catch (error) {
            console.error(`[blockchainOwnershipService] Error getting ownership status for deal ${dealId}:`, error);
            throw error;
        }
    },

    /**
     * Poll blockchain status until ownership is assigned
     * @param {number} dealId - The deal ID to poll
     * @param {function} onUpdate - Callback to update UI with current status
     * @param {number} maxAttempts - Maximum number of polling attempts (default: 60, ~5 minutes)
     * @param {number} intervalMs - Polling interval in milliseconds (default: 5000, 5 seconds)
     * @returns {Promise} Final status when ownership is assigned or max attempts reached
     */
    pollBlockchainStatus: async (dealId, onUpdate, maxAttempts = 60, intervalMs = 5000) => {
        let attempts = 0;
        
        return new Promise((resolve, reject) => {
            const pollInterval = setInterval(async () => {
                attempts++;
                console.log(`[blockchainOwnershipService] Polling attempt ${attempts}/${maxAttempts}`);
                
                try {
                    const response = await blockchainOwnershipService.getBlockchainStatus(dealId);
                    
                    // Update UI with current status
                    if (onUpdate) {
                        onUpdate({
                            status: 'polling',
                            data: response.data,
                            attempt: attempts,
                            maxAttempts
                        });
                    }

                    // Check if ownership has been assigned
                    if (response.data?.isOwnerAssignedOnChain === true) {
                        console.log('[blockchainOwnershipService] Ownership assigned! Stopping poll.');
                        clearInterval(pollInterval);
                        resolve({
                            status: 'completed',
                            data: response.data,
                            attempts
                        });
                    }

                    // Check if max attempts reached
                    if (attempts >= maxAttempts) {
                        console.warn(`[blockchainOwnershipService] Max polling attempts (${maxAttempts}) reached`);
                        clearInterval(pollInterval);
                        resolve({
                            status: 'timeout',
                            data: response.data,
                            attempts
                        });
                    }
                } catch (error) {
                    console.error(`[blockchainOwnershipService] Polling error on attempt ${attempts}:`, error);
                    
                    if (onUpdate) {
                        onUpdate({
                            status: 'error',
                            error: error.message,
                            attempt: attempts,
                            maxAttempts
                        });
                    }

                    // Stop polling on error after a few attempts
                    if (attempts >= 3) {
                        clearInterval(pollInterval);
                        reject(error);
                    }
                }
            }, intervalMs);
        });
    }
};

export default blockchainOwnershipService;
