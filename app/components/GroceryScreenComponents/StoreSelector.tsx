// // components/StoreSelector.tsx
// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// type Props = {
//   selectedStore: string;
//   onSelectStore: (store: string) => void;
// };

// export default function StoreSelector({ selectedStore, onSelectStore }: Props) {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Select Store:</Text>
//       <Picker
//         selectedValue={selectedStore}
//         onValueChange={onSelectStore}
//         style={styles.picker}
//       >
//         <Picker.Item label="Walmart" value="Walmart" />
//         <Picker.Item label="Target" value="Target" />
//         <Picker.Item label="Fry’s" value="Frys" />
//         <Picker.Item label="Costco" value="Costco" />
//       </Picker>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { marginBottom: 10 },
//   label: { fontSize: 16, fontWeight: '600' },
//   picker: { height: 40, width: '100%' },
// });
