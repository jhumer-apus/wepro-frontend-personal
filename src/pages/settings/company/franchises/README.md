# Franchise Creation Page with Google Maps Integration

This page provides a comprehensive form for creating new company franchises with integrated Google Maps location selection.

## Features

- **Complete Form**: All required fields for franchise creation as per API specification
- **Google Maps Integration**: Interactive map with search, click-to-pin, and drag functionality
- **Auto-population**: Address fields automatically populated from map selection
- **Form Validation**: Client-side validation with clear error messages
- **Responsive Design**: Mobile-friendly layout with proper navigation
- **Loading States**: Visual feedback during form submission and map loading

## API Integration

### Endpoint

```
POST: /v1/franchises
```

### Payload Structure

```json
{
  "name": "string",
  "code": "string",
  "ownerName": "string",
  "status": "string",
  "weproUsername": "string",
  "email": "string",
  "phoneNumber": "string",
  "address": "string",
  "addressLine2": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "country": "string",
  "addressId": "string",
  "lat": "string",
  "lng": "string"
}
```

## Google Maps Integration

### Setup Requirements

1. **API Key**: Obtain a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable Services**: Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API

### Environment Configuration

Add your Google Maps API key to your environment files:

```bash
# .env.local, .env.production, .env.staging
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Map Features

- **Search Box**: Integrated search box for location lookup
- **Click to Pin**: Click anywhere on the map to set a marker
- **Drag Marker**: Drag the marker to fine-tune location
- **Auto-population**: Address fields automatically filled based on selection
- **Reverse Geocoding**: Converts coordinates to address when marker is moved

### Map Controls

- **Search**: Type to search for specific locations
- **Zoom**: Mouse wheel or zoom controls
- **Pan**: Click and drag to move around the map
- **Marker**: Draggable marker for precise location selection

## Form Validation

### Required Fields

- Franchise Name
- Franchise Code
- Owner Name
- Email
- Address
- City
- State
- Zip Code
- Country

### Validation Rules

- Email format validation
- Required field validation
- Real-time error clearing on input

## Security Considerations

### XSS Prevention

- All user inputs are properly sanitized
- React's built-in XSS protection utilized
- No direct DOM manipulation

### CSRF Protection

- Form submission includes proper headers
- API endpoints should implement CSRF tokens
- Consider adding `Authorization` header for authenticated requests

### Data Validation

- Client-side validation for immediate feedback
- Server-side validation required for production
- Input sanitization and type checking

## Implementation Details

### Component Structure

```
CreateFranchisePage
├── Header with navigation
├── Form sections
│   ├── Basic Information
│   └── Address Information
├── Google Maps integration
└── Submit/Cancel buttons
```

### State Management

- Form data managed with React useState
- Map instances stored in useRef for performance
- Loading states for async operations

### Error Handling

- Form validation errors displayed inline
- API error handling with user-friendly messages
- Loading indicators for better UX

## Usage Instructions

1. **Navigate** to `/settings/company/franchises/create`
2. **Fill** basic franchise information
3. **Use the map** to select location:
   - Search for a specific address
   - Click on the map to set a marker
   - Drag the marker for precise positioning
4. **Verify** auto-populated address fields
5. **Submit** the form to create the franchise

## Customization

### Styling

- Uses Tailwind CSS for consistent styling
- Follows existing design system patterns
- Responsive grid layout for different screen sizes

### Map Styling

- Custom map styles for cleaner appearance
- POI labels hidden for better focus
- Consistent with application theme

### Form Layout

- Two-column layout on large screens
- Single column on mobile devices
- Card-based organization for better readability

## Troubleshooting

### Common Issues

1. **Map not loading**
   - Check Google Maps API key configuration
   - Verify API services are enabled
   - Check browser console for errors

2. **Search not working**
   - Ensure Places API is enabled
   - Check API key permissions
   - Verify billing is set up

3. **Address fields not populating**
   - Check Geocoding API is enabled
   - Verify map marker position
   - Check browser console for errors

### Debug Mode

Enable debug mode in environment configuration:

```bash
NEXT_PUBLIC_ENABLE_DEBUG=true
```

## Performance Considerations

- Map initialization only when component mounts
- Debounced input handling for better performance
- Efficient state updates with proper React patterns
- Lazy loading of Google Maps API

## Browser Support

- Modern browsers with ES6+ support
- Google Maps API compatibility
- Responsive design for mobile devices
- Progressive enhancement approach

## Dependencies

- React 18+
- Next.js
- Google Maps JavaScript API
- Tailwind CSS
- Lucide React icons
- Custom UI components

## Future Enhancements

- Address autocomplete suggestions
- Multiple location support
- Map clustering for multiple franchises
- Offline map support
- Advanced location analytics
