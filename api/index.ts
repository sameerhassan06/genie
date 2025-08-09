// This file is not needed for static deployment
// The platform will be deployed as a static frontend-only app
// Backend functionality will need to be separated or use a different deployment strategy

export default function handler(req: any, res: any) {
  res.status(200).json({ message: 'API not available in static deployment' });
}