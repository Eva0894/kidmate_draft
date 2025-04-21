// eduStyles.ts
import { StyleSheet } from 'react-native';

const meStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf9ef',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    textAlign: 'center',     
    alignSelf: 'center', 
    fontSize: 24,
    color: '#E5911B',
    marginTop: 30,
    marginBottom: 20,
    fontWeight: '800',
    fontFamily: 'Futura',
    textShadowColor: '#E5911B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  listItem: {
    fontSize: 16,
    paddingVertical: 6,
    color: '#555',
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
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 18,
    color: '#d4a373',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backText: {
    fontSize: 16,
    color: '#E5911B',
    marginLeft: 8,
    fontWeight: '500',
    fontFamily:'Futura',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#E5911B',
    fontFamily:'Futura',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#222',
  },
  contactBox: {
    backgroundColor: '#fce9c6',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  contactLine: {
    fontSize: 16,
    color: '#222',
  },
  contactText: {
    fontSize: 16,
    color: '#333',
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