import React, { useState } from "react";
import { View, Text, Button, TextInput } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

// Basit radio button componenti
type RadioButtonProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};
const RadioButton = ({ options, value, onChange }: RadioButtonProps) => (
  <View>
    {options.map((option: string) => (
      <View key={option} style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
        <Text onPress={() => onChange(option)} style={{ marginRight: 8 }}>
          {value === option ? "🔘" : "⚪"}
        </Text>
        <Text onPress={() => onChange(option)}>{option}</Text>
      </View>
    ))}
  </View>
);

// Basit multi select componenti
type MultiSelectProps = {
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
};
const MultiSelect = ({ options, values, onChange }: MultiSelectProps) => (
  <View>
    {options.map((option: string) => (
      <View key={option} style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
        <Text
          onPress={() => {
            if (values.includes(option)) {
              onChange(values.filter((v: string) => v !== option));
            } else {
              onChange([...values, option]);
            }
          }}
          style={{ marginRight: 8 }}
        >
          {values.includes(option) ? "✅" : "⬜"}
        </Text>
        <Text
          onPress={() => {
            if (values.includes(option)) {
              onChange(values.filter((v: string) => v !== option));
            } else {
              onChange([...values, option]);
            }
          }}
        >
          {option}
        </Text>
      </View>
    ))}
  </View>
);

// Hedefleri backend'e uygun şekilde eşle
const GOAL_MAP: Record<string, string> = {
  "Kas İnşa": "Kas geliştirmek",
  "Kuvvet Kazanma": "Kuvvet kazanmak",
  "Kilo vermek": "Kilo vermek",
  "Temel Egzersizler": "Temel egzersizler",
  "Kondisyon": "Kondisyon",
  "Spor": "Spor",
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<string>("E");
  const [goals, setGoals] = useState<string[]>([]);
  const [weight, setWeight] = useState<number>(0);
  const [age, setAge] = useState<number>(0);
  const [height, setHeight] = useState(0);
  const [trainingExperience, setTrainingExperience] = useState<string>("beginner");
  const [trainingDuration, setTrainingDuration] = useState<number>(1);

  const [isSuccess, setIsSuccess] = useState(false);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleFinish = async () => {
    fetch('http://10.0.2.2:3000/Api/v1/users/userprofile', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + await SecureStore.getItemAsync("auth_token"),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_sex: gender,
        training_aim: goals,
        weight,
        age,
        height,
        training_experience: trainingExperience,
        training_duration: trainingDuration,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setIsSuccess(true);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    if (isSuccess) {
      router.push('/screens/home');
    }

    await SecureStore.setItemAsync("onboarding_done", "true");
    router.replace("/screens/home");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      {step === 1 && (
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 18, marginBottom: 12 }}>Cinsiyetinizi seçin:</Text>
          <RadioButton options={["K", "E"]} value={gender} onChange={setGender} />
          <Button title="İleri" onPress={handleNext} disabled={!gender} />
        </View>
      )}
      {step === 2 && (
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 18, marginBottom: 12 }}>Hedeflerinizi seçin:</Text>
          <MultiSelect options={["Kas İnşa", "Kuvvet Kazanma", "Kilo vermek", "Temel Egzersizler", "Kondisyon", "Spor"]} values={goals} onChange={setGoals} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
            <Button title="Geri" onPress={handleBack} />
            <Button title="İleri" onPress={handleNext} disabled={goals.length === 0} />
          </View>
        </View>
      )}
      {step === 3 && (
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 18, marginBottom: 12 }}>Kilonuzu girin (kg):</Text>
          <TextInput
            value={weight.toString()}
            onChangeText={(text) => setWeight(Number(text))}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 16 }}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Button title="Geri" onPress={handleBack} />
            <Button title="İleri" onPress={handleNext} disabled={!weight} />
          </View>
        </View>
      )}
      {step === 4 && (
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 18, marginBottom: 12 }}>Yaşınızı girin:</Text>
          <TextInput
            value={age.toString()}
            onChangeText={(text) => setAge(Number(text))}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 16 }}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Button title="Geri" onPress={handleBack} />
            <Button title="İleri" onPress={handleNext} disabled={!age} />
          </View>
        </View>
      )}
      {step === 5 && (
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 18, marginBottom: 12 }}>Boyunuzu girin (cm):</Text>
          <TextInput
            value={height.toString()}
            onChangeText={(text) => setHeight(Number(text))}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 16 }}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Button title="Geri" onPress={handleBack} />
            <Button title="İleri" onPress={handleNext} disabled={!height} />
          </View>
        </View>
      )}
      {step === 6 && (
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 18, marginBottom: 12 }}>Tecrübe durumunuz:</Text>
          <RadioButton options={["Başlangıç", "Orta", "Profesyonel"]} value={trainingExperience} onChange={setTrainingExperience} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Button title="Geri" onPress={handleBack} />
            <Button title="İleri" onPress={handleNext} disabled={!trainingExperience} />
          </View>
        </View>
      )}
      {step === 7 && (
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 18, marginBottom: 12 }}>Haftada kaç gün çalışacaksınız?</Text>
          <RadioButton options={["1", "2", "3", "4", "5", "6", "7"]} value={trainingDuration.toString()} onChange={(value) => setTrainingDuration(Number(value))} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Button title="Geri" onPress={handleBack} />
            <Button title="Bitir" onPress={handleFinish} disabled={!trainingDuration} />
          </View>
        </View>
      )}
      <Text style={{ position: "absolute", bottom: 24, color: "#888" }}>Adım {step} / 7</Text>
    </View>
  );
}