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
  propertyType: ['Duplex', 'Bungalow', 'Apartment', 'Land'],
  currency: ['NGN', 'USD', 'EUR'],
  areaUnit: ['sqm', 'sqft'],
  plotSizeUnit: ['sqm', 'sqft'],
  furnishing: ['Furnished', 'Unfurnished', 'Partially Furnished'],
  flooring: ['Tiles', 'Wood', 'Marble', 'Concrete'],
  paymentPlan: ['Outright', 'Installments', 'Mortgage'],
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
    files: [],
  };

  const pickFiles = async (setFieldValue: any, currentFiles: any[]) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', multiple: true });
      if (!res.canceled) {
        // Combine new files with existing ones
        setFieldValue('files', [...currentFiles, ...res.assets]);
      }
    } catch (err) {
      Alert.alert('Error', 'File selection failed');
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    if (!values.files || values.files.length === 0) {
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
        type: file.mimeType,
      } as any);
    });

    try {
      const response = await axios.post('https://infinity-housing.onrender.com/property', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Property submitted successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Submission failed.');
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
                <TextInput label="Listing Type" value={values.listingType} onChangeText={handleChange('listingType')} mode="outlined" style={styles.input} />
                <TextInput label="Property Type" value={values.propertyType} onChangeText={handleChange('propertyType')} mode="outlined" style={styles.input} />
                <TextInput label="Price" value={values.price} onChangeText={handleChange('price')} keyboardType="numeric" mode="outlined" style={styles.input} />
                <TextInput label="Currency" value={values.currency} onChangeText={handleChange('currency')} mode="outlined" style={styles.input} />
                <View style={styles.switchRow}>
                  <Text>Is Negotiable</Text>
                  <Switch value={values.isNegotiable} onValueChange={val => { void setFieldValue('isNegotiable', val); }} />
                </View>
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
                {["bedrooms", "bathrooms", "toilets", "areaValue", "plotSizeValue", "yearBuilt", "floors"].map(field => (
                  <TextInput
                    key={field}
                    label={field}
                    value={
                      typeof values[field as keyof typeof values] === 'string'
                        ? (values[field as keyof typeof values] as string)
                        : values[field as keyof typeof values] === null || values[field as keyof typeof values] === undefined
                          ? undefined
                          : String(values[field as keyof typeof values])
                    }
                    onChangeText={handleChange(field)}
                    mode="outlined"
                    style={styles.input}
                  />
                ))}
                <TextInput label="Furnishing" value={values.furnishing} onChangeText={handleChange('furnishing')} mode="outlined" style={styles.input} />
                <TextInput label="Flooring" value={values.flooring} onChangeText={handleChange('flooring')} mode="outlined" style={styles.input} />
                <TextInput label="Availability" value={values.availability} onChangeText={handleChange('availability')} mode="outlined" style={styles.input} />
              </List.Accordion>

              <List.Accordion title="Financial & Legal" left={props => <List.Icon {...props} icon="currency-ngn" />}>
                {["maintenanceFee", "agencyFee", "paymentPlan", "ownership"].map(field => (
                  <TextInput
                    key={field}
                    label={field}
                    value={
                      typeof values[field as keyof typeof values] === 'string'
                        ? (values[field as keyof typeof values] as string)
                        : values[field as keyof typeof values] === null || values[field as keyof typeof values] === undefined
                          ? undefined
                          : String(values[field as keyof typeof values])
                    }
                    onChangeText={handleChange(field)}
                    mode="outlined"
                    style={styles.input}
                  />
                ))}
                <View style={styles.switchRow}>
                  <Text>Certificate of Occupancy</Text>
                  <Switch value={values.cOfO} onValueChange={val => { void setFieldValue('cOfO', val); }} />
                </View>
                <View style={styles.switchRow}>
                  <Text>Governor Consent</Text>
                  <Switch value={values.governorConsent} onValueChange={val => { void setFieldValue('governorConsent', val); }} />
                </View>
              </List.Accordion>

              <List.Accordion title="Additional Info" left={props => <List.Icon {...props} icon="dots-horizontal" />}>
                {["petPolicy", "targetTenant", "proximityToRoad"].map(field => (
                  <TextInput
                    key={field}
                    label={field}
                    value={
                      typeof values[field as keyof typeof values] === 'string'
                        ? (values[field as keyof typeof values] as string)
                        : values[field as keyof typeof values] === null || values[field as keyof typeof values] === undefined
                          ? undefined
                          : String(values[field as keyof typeof values])
                    }
                    onChangeText={handleChange(field)}
                    mode="outlined"
                    style={styles.input}
                  />
                ))}
              </List.Accordion>

              <Button
                icon="plus"
                mode="contained"
                onPress={() => pickFiles(setFieldValue, values.files)}
                style={styles.button}
              >
                {values.files && values.files.length > 0 ? 'Files Selected' : 'Pick Files'}
              </Button>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 }}>
                {values.files && values.files.map((file: any, idx: number) => (
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
                        const newFiles = values.files.filter((_: any, i: number) => i !== idx);
                        setFieldValue('files', newFiles);
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
