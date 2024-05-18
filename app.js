import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { DocumentPicker } from 'expo-document-picker';
import { v4 as uuidv4 } from 'uuid';
import DraggableFlatList from 'react-native-draggable-flatlist';

const Stack = createStackNavigator();

const App = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Course Builder</Text>
      <Button title="Create Course" onPress={() => navigation.navigate('CreateCourse')} />
    </View>
  );
};

const CreateCourseScreen = () => {
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState({});

  const addModule = () => {
    const newModule = { id: uuidv4(), name: 'New Module', resources: [] };
    setModules([...modules, newModule]);
    setResources({ ...resources, [newModule.id]: [] });
  };

  const renameModule = (id, newName) => {
    setModules(modules.map(module => (module.id === id ? { ...module, name: newName } : module)));
  };

  const deleteModule = id => {
    setModules(modules.filter(module => module.id !== id));
    const newResources = { ...resources };
    delete newResources[id];
    setResources(newResources);
  };

  const addResource = async (moduleId, type, name, file = null) => {
    const newResource = { id: uuidv4(), type, name, file };
    setResources({
      ...resources,
      [moduleId]: [...resources[moduleId], newResource],
    });
  };

  const renameResource = (moduleId, resourceId, newName) => {
    setResources({
      ...resources,
      [moduleId]: resources[moduleId].map(resource =>
        resource.id === resourceId ? { ...resource, name: newName } : resource
      ),
    });
  };

  const deleteResource = (moduleId, resourceId) => {
    setResources({
      ...resources,
      [moduleId]: resources[moduleId].filter(resource => resource.id !== resourceId),
    });
  };

  const handlePickFile = async moduleId => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      addResource(moduleId, 'file', result.name, result);
    }
  };

  const renderItem = ({ item, drag }) => (
    <TouchableOpacity
      style={styles.moduleContainer}
      onLongPress={drag}
    >
      <TextInput
        style={styles.moduleTitle}
        value={item.name}
        onChangeText={text => renameModule(item.id, text)}
      />
      <Button title="Delete Module" onPress={() => deleteModule(item.id)} />
      <Button title="Add File" onPress={() => handlePickFile(item.id)} />
      <Button title="Add Link" onPress={() => addResource(item.id, 'link', 'New Link')} />
      {resources[item.id]?.map(resource => (
        <View key={resource.id} style={styles.resourceContainer}>
          <TextInput
            style={styles.resourceTitle}
            value={resource.name}
            onChangeText={text => renameResource(item.id, resource.id, text)}
          />
          <Button title="Delete Resource" onPress={() => deleteResource(item.id, resource.id)} />
        </View>
      ))}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Button title="Add Module" onPress={addModule} />
      <DraggableFlatList
        data={modules}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onDragEnd={({ data }) => setModules(data)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  moduleContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  moduleTitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  resourceContainer: {
    marginTop: 10,
    padding: 5,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
  },
  resourceTitle: {
    fontSize: 16,
  },
});

export default App;
