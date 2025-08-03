// React Native Full Property Listing Form + File Upload + Dropdowns + Grouping
// Dependencies: formik, yup, react-native-paper, axios, react-native-document-picker
import React from 'react';
import { ScrollView, View, StyleSheet, Alert, Image } from 'react-native';
import { TextInput, Button, Text, Switch, HelperText, Divider, List, Menu } from 'react-native-paper';
// @ts-ignore
import * as DocumentPicker from 'expo-document-picker';
import { Formik, FormikErrors } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { TextInputLabelProp } from 'react-native-paper/lib/typescript/components/TextInput/types';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Dropdown } from "react-native-paper-dropdown";
 import * as FileSystem from 'expo-file-system';
 import AsyncStorage from '@react-native-async-storage/async-storage';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007AFF', // This will be used for active accordion text, etc.
  },
};

interface PropertyForm2Props {
  initialData?: any; // Replace 'any' with the actual type if you have it
  onSubmit: (data: any) => void; // Adjust the type as needed
  isEdit?: boolean;
}

const validationSchema = Yup.object().shape({
  listingType: Yup.string().required('Required'),
  propertyType: Yup.string().required('Required'),
  price: Yup.number().required('Required'),
  bedrooms: Yup.number().required('Required'),
  bathrooms: Yup.number().required('Required'),
  toilets: Yup.number().required('Required'),
  areaValue: Yup.number().required('Required'),
  plotSizeValue: Yup.number().required('Required'),
});

const dropdownOptions = {
  listingType: ['For Sale', 'For Rent'],
  propertyType: ['Duplex', 'Bungalow', 'Flat', 'Self-Contain', 'Terraced', 'Mansion'],
  currency: ['NGN', 'USD', 'EUR'],
  areaUnit: ['sqm', 'sqft'],
  plotSizeUnit: ['sqm', 'sqft'],
  furnishing: ['Fully Furnished', 'Semi-Furnished', 'Unfurnished'],
  flooring: ['Tiles', 'Wood', 'Marble', 'Concrete'],
  paymentPlan: ['Outright', 'Installments', 'Mortgage'],
  availability: ['Available Now', 'Available Soon', 'Not Available'],
  ownership: ['Freehold', 'Leasehold', 'Joint Ownership'],
  petPolicy: ['Allowed', 'Not Allowed'],
  percentage: ['0%', '5%', '10%', '15%', '20%'],
  targetTenant: ['Family', 'Single', 'Students', 'Professionals'],
  proximityToRoad: ['Very Close', 'Close', 'Moderate', 'Far'],
  bedroom: ['1', '2', '3', '4', '5+'],
  bathroom: ['1', '2', '3', '4', '5+'],
  toilet: ['1', '2', '3', '4', '5+'],
  yearBuilt: ['2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010'],
  floors: ['1', '2', '3', '4', '5+'],
};

const PropertyForm2: React.FC<PropertyForm2Props> = ({ initialData, onSubmit, isEdit }) => {
  const initialValues = {
    listingType: '',
    propertyType: '',
    price: '',
    currency: 'NGN',
    isNegotiable: false as boolean,
    street: '',
    area: '',
    city: '',
    state: '',
    lga: '',
    country: '',
    longitude: '',
    latitude: '',
    bedrooms: '',
    bathrooms: '',
    toilets: '',
    areaValue: '',
    areaUnit: 'sqm',
    plotSizeValue: '',
    plotSizeUnit: 'sqm',
    yearBuilt: '',
    floors: '',
    furnishing: '',
    flooring: '',
    availability: '',
    maintenanceFee: '',
    agencyFee: '',
    paymentPlan: '',
    ownership: '',
    cOfO: false,
    governorConsent: false,
    petPolicy: '',
    targetTenant: '',
    proximityToRoad: '',
    images: [],
  };

  const pickFiles = async (setFieldValue: any, currentImages: any[]) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', multiple: true });
      if (!res.canceled) {
        // Combine new files with existing ones
        setFieldValue('images', [...currentImages, ...res.assets]);
      }
    } catch (err) {
      Alert.alert('Error', 'File selection failed');
    }
  };

  /**const handleSubmit = async (values: any, { setSubmitting }: any) => {
    if (!values.files || values.files.length === 0 ) {
      Alert.alert('Missing Files', 'Please select at least one file.');
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    values.files.forEach((file: any, idx: number) => {
      // For React Native, FormData expects a file object with uri, name, and type
      formData.append('files[]', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'image/jpeg'
      } as any);
    });

    try {
      const response = await axios.post(
        'https://infinity-housing.onrender.com/property',
        formData
      );
      Alert.alert('Success', 'Property submitted successfully.');
    } catch (error) {
      const err = error as { message?: string };
      console.log('Axios error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };**/


const handleSubmit = async (values: any, { setSubmitting }: any) => {
  if (!values.images || values.images.length === 0) {
    Alert.alert('Missing Images', 'Please select at least one image.');
    setSubmitting(false);
    return;
  }

  const token = await AsyncStorage.getItem('access_token');
  const landlordJson = await AsyncStorage.getItem('landlord_info');
  const landlord = landlordJson ? JSON.parse(landlordJson) : null;

  if (!token || !landlord) {
    Alert.alert('Auth Error', 'You are not logged in or landlord info missing.');
    setSubmitting(false);
    return;
  }

  // ✅ Build payload including listedBy
  const payload = {
    listingType: values.listingType,
    propertyType: values.propertyType,
    price: parseFloat(values.price),
    currency: values.currency,
    isNegotiable: values.isNegotiable,
    address: {
      street: values.street,
      area: values.area,
      city: values.city,
      state: values.state,
      lga: values.lga,
      country: values.country,
      coordinates: {
        type: 'Point',
        coordinates: [parseFloat(values.longitude), parseFloat(values.latitude)],
      },
    },
    bedrooms: parseInt(values.bedrooms),
    bathrooms: parseInt(values.bathrooms),
    toilets: parseInt(values.toilets),
    area: {
      value: parseFloat(values.areaValue),
      unit: values.areaUnit,
    },
    plotSize: {
      value: parseFloat(values.plotSizeValue),
      unit: values.plotSizeUnit,
    },
    yearBuilt: parseInt(values.yearBuilt),
    floors: parseInt(values.floors),
    furnishing: values.furnishing,
    flooring: [values.flooring],
    availability: values.availability,
    listedBy: {
      name: landlord.name,
      phone: landlord.phone || 'N/A',
      role: 'landlord',
      agency: landlord.agency || 'N/A',
    },
    images: values.images.map((file: any) => ({
      uri: file.uri,
      name: file.name || 'upload.jpg',
      type: file.mimeType || 'image/jpeg',
    })),
    videos: [],
    floorPlan: '',
    features: {
      interior: [],
      exterior: [],
      security: [],
      amenities: [],
    },
    locationAdvantages: [],
    financialDetails: {
      maintenanceFee: parseFloat(values.maintenanceFee),
      agencyFee: values.agencyFee,
      paymentPlan: [values.paymentPlan],
    },
    legalStatus: {
      ownership: values.ownership,
      cOfO: values.cOfO,
      governorConsent: values.governorConsent,
    },
    additionalInfo: {
      petPolicy: values.petPolicy,
      targetTenant: values.targetTenant,
      proximityToRoad: values.proximityToRoad,
    },
  };

  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  values.images.forEach((file: any) => {
    formData.append('images[]', {
      uri: file.uri,
      name: file.name || 'upload.jpg',
      type: file.mimeType || 'image/jpeg',
    } as any);
  });

  try {
    const response = await axios.post(
      'https://infinity-housing.onrender.com/property',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    Alert.alert('Success', 'Property submitted successfully.');
    console.log('✅ Upload response:', response.data);
  } catch (error: any) {
    console.log('❌ Axios error:', error.message);
    Alert.alert('Error', error.message || 'Submission failed.');
  } finally {
    setSubmitting(false);
  }
};


  const renderDropdown = (label: TextInputLabelProp | undefined, value: string | undefined, setFieldValue: (arg0: any, arg1: any) => void, options: any[]) => (
    <Menu
      visible={false}
      onDismiss={() => {}}
      anchor={
        <TextInput
          label={label}
          value={value}
          mode="outlined"
          style={styles.input}
          right={<TextInput.Icon icon="menu-down" />}
          onFocus={() => {}}
        />
      }
    >
      {options.map((opt: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, idx: React.Key | null | undefined) => (
        <Menu.Item key={idx} onPress={() => setFieldValue(label, opt)} title={opt} />
      ))}
    </Menu>
  );

  return (
    <PaperProvider theme={theme}>
      <ScrollView contentContainerStyle={styles.container}>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
            <View>
              <List.Accordion title="Basic Info" left={props => <List.Icon {...props} icon="information" />}>
                <Dropdown
                  label="Listing Type"
                  mode="outlined"
                  value={values.listingType}
                  onSelect={(v?: string) => setFieldValue('listingType', v)}
                  options={dropdownOptions.listingType.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.listingType && errors.listingType)}>{errors.listingType}</HelperText>
                <Dropdown
                  label="Property Type"
                  mode="outlined"
                  value={values.propertyType}
                  onSelect={(v?: string) => setFieldValue('propertyType', v)}
                  options={dropdownOptions.propertyType.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.propertyType && errors.propertyType)}>{errors.propertyType}</HelperText>
                <TextInput label="Price" value={values.price} onChangeText={handleChange('price')} keyboardType="numeric" mode="outlined" style={styles.input} />
                <HelperText type="error" visible={!!(touched.price && errors.price)}>{errors.price}</HelperText>
                <Dropdown
                  label="Currency"
                  mode="outlined"
                  value={values.currency}
                  onSelect={(v?: string) => setFieldValue('currency', v)}
                  options={dropdownOptions.currency.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.currency && errors.currency)}>{errors.currency}</HelperText>
                <View style={styles.switchRow}>
                  <Text>Is Negotiable</Text>
                  <Switch value={values.isNegotiable} onValueChange={val => { void setFieldValue('isNegotiable', val); }} />
                </View>
                <HelperText type="error" visible={!!(touched.isNegotiable && errors.isNegotiable)}>{errors.isNegotiable}</HelperText>
              </List.Accordion>

              <List.Accordion title="Address Info" left={props => <List.Icon {...props} icon="map-marker" />}>
                {["street", "area", "city", "state", "lga", "country", "longitude", "latitude"].map(field => (
                  <TextInput
                    key={field}
                    label={field}
                    value={typeof values[field as keyof typeof values] === 'string' ? values[field as keyof typeof values] as string : ''}
                    onChangeText={handleChange(field)}
                    mode="outlined"
                    style={styles.input}
                  />
                ))}
              </List.Accordion>

              <List.Accordion title="Property Details" left={props => <List.Icon {...props} icon="home" />}>
                <Dropdown
                  label="bedrooms"
                  mode="outlined"
                  value={values.bedrooms}
                  onSelect={(v?: string) => setFieldValue('bedrooms', v)}
                  options={dropdownOptions.bedroom.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.bedrooms && errors.bedrooms)}>{errors.bedrooms}</HelperText>
                <Dropdown
                  label="bathrooms"
                  mode="outlined"
                  value={values.bathrooms}
                  onSelect={(v?: string) => setFieldValue('bathrooms', v)}
                  options={dropdownOptions.bathroom.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.bathrooms && errors.bathrooms)}>{errors.bathrooms}</HelperText>
                <Dropdown
                  label="toilets"
                  mode="outlined"
                  value={values.toilets}
                  onSelect={(v?: string) => setFieldValue('toilets', v)}
                  options={dropdownOptions.toilet.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.toilets && errors.toilets)}>{errors.toilets}</HelperText>
                <TextInput
                  label="areaValue"
                  value={typeof values["areaValue"] === 'string' ? values["areaValue"] : values["areaValue"] === null || values["areaValue"] === undefined ? '' : String(values["areaValue"])}
                  onChangeText={handleChange('areaValue')}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!(touched.areaValue && errors.areaValue)}>{errors.areaValue}</HelperText>
                <Dropdown
                  label="Area Unit"
                  mode="outlined"
                  value={values.areaUnit}
                  onSelect={(v?: string) => setFieldValue('areaUnit', v)}
                  options={dropdownOptions.areaUnit.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.areaUnit && errors.areaUnit)}>{errors.areaUnit}</HelperText>
                <TextInput
                  label="plotSizeValue"
                  value={typeof values["plotSizeValue"] === 'string' ? values["plotSizeValue"] : values["plotSizeValue"] === null || values["plotSizeValue"] === undefined ? '' : String(values["plotSizeValue"])}
                  onChangeText={handleChange('plotSizeValue')}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!(touched.plotSizeValue && errors.plotSizeValue)}>{errors.plotSizeValue}</HelperText>
                <Dropdown
                  label="Plot Size Unit"
                  mode="outlined"
                  value={values.plotSizeUnit}
                  onSelect={(v?: string) => setFieldValue('plotSizeUnit', v)}
                  options={dropdownOptions.plotSizeUnit.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.plotSizeUnit && errors.plotSizeUnit)}>{errors.plotSizeUnit}</HelperText>
                <Dropdown
                  label="yearBuilt"
                  mode="outlined"
                  value={values.yearBuilt}
                  onSelect={(v?: string) => setFieldValue('yearBuilt', v)}
                  options={dropdownOptions.yearBuilt.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.yearBuilt && errors.yearBuilt)}>{errors.yearBuilt}</HelperText>
                <Dropdown
                  label="floors"
                  mode="outlined"
                  value={values.floors}
                  onSelect={(v?: string) => setFieldValue('floors', v)}
                  options={dropdownOptions.floors.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.floors && errors.floors)}>{errors.floors}</HelperText>
                <Dropdown
                  label="Furnishing"
                  mode="outlined"
                  value={values.furnishing}
                  onSelect={(v?: string) => setFieldValue('furnishing', v)}
                  options={dropdownOptions.furnishing.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.furnishing && errors.furnishing)}>{errors.furnishing}</HelperText>
                <Dropdown
                  label="Flooring"
                  mode="outlined"
                  value={values.flooring}
                  onSelect={(v?: string) => setFieldValue('flooring', v)}
                  options={dropdownOptions.flooring.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.flooring && errors.flooring)}>{errors.flooring}</HelperText>
                <Dropdown
                  label="availability"
                  mode="outlined"
                  value={values.availability}
                  onSelect={(v?: string) => setFieldValue('availability', v)}
                  options={dropdownOptions.availability.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.availability && errors.availability)}>{errors.availability}</HelperText>
              </List.Accordion>

              <List.Accordion title="Financial & Legal" left={props => <List.Icon {...props} icon="currency-ngn" />}>
                <Dropdown
                  label="maintenanceFee"
                  mode="outlined"
                  value={values.maintenanceFee}
                  onSelect={(v?: string) => setFieldValue('maintenanceFee', v)}
                  options={dropdownOptions.percentage.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.maintenanceFee && errors.maintenanceFee)}>{errors.maintenanceFee}</HelperText>
                <Dropdown
                  label="agencyFee"
                  mode="outlined"
                  value={values.agencyFee}
                  onSelect={(v?: string) => setFieldValue('agencyFee', v)}
                  options={dropdownOptions.percentage.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.agencyFee && errors.agencyFee)}>{errors.agencyFee}</HelperText>
                <Dropdown
                  label="Payment Plan"
                  mode="outlined"
                  value={values.paymentPlan}
                  onSelect={(v?: string) => setFieldValue('paymentPlan', v)}
                  options={dropdownOptions.paymentPlan.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.paymentPlan && errors.paymentPlan)}>{errors.paymentPlan}</HelperText>
                <Dropdown
                  label="ownership"
                  mode="outlined"
                  value={values.ownership}
                  onSelect={(v?: string) => setFieldValue('ownership', v)}
                  options={dropdownOptions.ownership.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.ownership && errors.ownership)}>{errors.ownership}</HelperText>
                <View style={styles.switchRow}>
                  <Text>Certificate of Occupancy</Text>
                  <Switch value={values.cOfO} onValueChange={val => { void setFieldValue('cOfO', val); }} />
                </View>
                <HelperText type="error" visible={!!(touched.cOfO && errors.cOfO)}>{errors.cOfO}</HelperText>
                <View style={styles.switchRow}>
                  <Text>Governor Consent</Text>
                  <Switch value={values.governorConsent} onValueChange={val => { void setFieldValue('governorConsent', val); }} />
                </View>
                <HelperText type="error" visible={!!(touched.governorConsent && errors.governorConsent)}>{errors.governorConsent}</HelperText>
              </List.Accordion>

              <List.Accordion title="Additional Info" left={props => <List.Icon {...props} icon="dots-horizontal" />}>
                <Dropdown
                  label="petPolicy"
                  mode="outlined"
                  value={values.petPolicy}
                  onSelect={(v?: string) => setFieldValue('petPolicy', v)}
                  options={dropdownOptions.petPolicy.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.petPolicy && errors.petPolicy)}>{errors.petPolicy}</HelperText>
                <Dropdown
                  label="targetTenant"
                  mode="outlined"
                  value={values.targetTenant}
                  onSelect={(v?: string) => setFieldValue('targetTenant', v)}
                  options={dropdownOptions.targetTenant.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.targetTenant && errors.targetTenant)}>{errors.targetTenant}</HelperText>
                <Dropdown
                  label="proximityToRoad"
                  mode="outlined"
                  value={values.proximityToRoad}
                  onSelect={(v?: string) => setFieldValue('proximityToRoad', v)}
                  options={dropdownOptions.proximityToRoad.map(opt => ({ label: opt, value: opt }))}
                />
                <HelperText type="error" visible={!!(touched.proximityToRoad && errors.proximityToRoad)}>{errors.proximityToRoad}</HelperText>
              </List.Accordion>

              <Button
                icon="plus"
                mode="contained"
                onPress={() => pickFiles(setFieldValue, values.images)}
                style={styles.button}
              >
                {values.images && values.images.length > 0 ? 'Files Selected' : 'Pick Files'}
              </Button>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 }}>
                {values.images && values.images.map((file: any, idx: number) => (
                  <View key={idx} style={{ position: 'relative', marginRight: 8, marginBottom: 8 }}>
                    {file.mimeType && file.mimeType.startsWith('image/') ? (
                      <Image
                        source={{ uri: file.uri }}
                        style={{ width: 60, height: 60, borderRadius: 6 }}
                      />
                    ) : (
                      <View style={{ width: 60, height: 60, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, color: '#888', textAlign: 'center' }}>{file.name}</Text>
                      </View>
                    )}
                    <Button
                      mode="text"
                      compact
                      style={{ position: 'absolute', backgroundColor: '', top: -10, right: -10, minWidth: 24, minHeight: 24, paddingRight: 5, zIndex: 1 }}
                      labelStyle={{ fontSize: 20, color: 'red' }}
                      onPress={() => {
                        const newImages = values.images.filter((_: any, i: number) => i !== idx);
                        setFieldValue('images', newImages);
                      }}
                    >
                      ×
                    </Button>
                  </View>
                ))}
              </View>

              <Button mode="contained" onPress={() => handleSubmit()} loading={isSubmitting} disabled={isSubmitting} style={styles.button}>
                Add Property
              </Button>
            </View>
          )}
        </Formik>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#E0E0E0',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    color: '#fff',
    backgroundColor: '#007AFF',
  },
});

export default PropertyForm2;
