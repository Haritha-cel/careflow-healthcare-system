import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import Button from './Button'
import { useRouter } from 'expo-router'

const SearchBar = ({ onChange }) => {

    const router = useRouter();

    return (
        <View style={styles.container}>

            <Button 
                onPress={() => router.back()} 
                style={styles.backButton}
            >
                <Text>Back</Text>
            </Button>

            <TextInput
                style={styles.input}
                placeholder='Search Doctor by name or speciality..'
                clearButtonMode='always'
                autoCapitalize='none'
                autoCorrect={false}
                onChangeText={onChange}
            />

        </View>
    )
}

export default SearchBar

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flexDirection: 'row',
        borderRadius: 10,
        margin: 10,
        height: 48,
        width: '95%',
        alignItems: 'center'
    },

    backButton: {
        paddingHorizontal: 10
    },

    input: {
        width: '85%'
    }
})