// meStyles.ts
import { Platform } from 'react-native';
import { StyleSheet } from 'react-native';

const meStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf9ef',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#E5911B',
    textAlign: 'center',
    fontFamily: Platform.select({
          ios: 'ChalkboardSE-Regular',
          android: 'monospace',}),
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  listItem: {
    fontSize: 14,
    paddingVertical: 6,
    color: '#333',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  rowText: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  arrow: {
    fontSize: 28,
    color: '#E5911B',
  },
  // title: {
  //   fontSize: 26,
  //   fontWeight: 'bold',
  //   marginBottom: 20,
  //   color: '#333',
  //   fontFamily: 'ChalkboardSE-Regular',
  // },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  content: {
    fontSize: 14,
    lineHeight: 24,
    color: '#333',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  contactBox: {
    backgroundColor: '#fce9c6',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  contactLine: {
    fontSize: 16,
    color: '#333',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'ChalkboardSE-Regular',
  },
  listBox: {
    backgroundColor: '#fce9c6',
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
    marginBottom: 16,
  },
});

export default meStyles;