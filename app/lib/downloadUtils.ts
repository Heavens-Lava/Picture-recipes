// lib/downloadUtils.ts

import { Buffer } from 'buffer';

export const downloadFile = async (url: string) => {
  try {
    // Validate the URL
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      throw new Error(`Invalid URL provided: ${url}`);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${url}`);
    }

    const buffer = await response.arrayBuffer(); // Get the image as a buffer
    return Buffer.from(buffer); // Convert it to a Node.js Buffer
  } catch (error) {
    console.error('Error downloading the file:', error.message || error);
    throw error;
  }
};
