import React, { useState } from 'react'
import { Tabs } from 'expo-router'

const ScreensLayout = () => {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', tabBarInactiveTintColor: 'gray' }}>
            <Tabs.Screen name='settings' options={{
                title: 'Settings',
            }} />

        </Tabs>
    )
}

export default ScreensLayout