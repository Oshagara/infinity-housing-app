import { Property } from '../types/Property';
import { API_URL } from '../config/constants';

class PropertyService {
  private static instance: PropertyService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${API_URL}/properties`;
  }

  static getInstance(): PropertyService {
    if (!PropertyService.instance) {
      PropertyService.instance = new PropertyService();
    }
    return PropertyService.instance;
  }

  async addProperty(property: Partial<Property>): Promise<Property> {
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Add property data as JSON string
      formData.append('property', JSON.stringify(property));

      // Add images
      if (property.images && property.images.length > 0) {
        property.images.forEach((uri, index) => {
          const filename = uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : 'image';

          formData.append('images', {
            uri,
            name: filename,
            type,
          } as any);
        });
      }

      // Add videos
      if (property.videos && property.videos.length > 0) {
        property.videos.forEach((uri, index) => {
          const filename = uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `video/${match[1]}` : 'video';

          formData.append('videos', {
            uri,
            name: filename,
            type,
          } as any);
        });
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add property');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  }

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(property),
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  async getProperty(id: string): Promise<Property> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch property');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  }

  async getProperties(filters?: any): Promise<Property[]> {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = filters ? `${this.baseUrl}?${queryParams}` : this.baseUrl;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }
}

export default PropertyService; 