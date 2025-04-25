import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Conv2D, Flatten, Dropout, MaxPooling2D
import numpy as np
import matplotlib.pyplot as plt

class MedicalImageClassifier:
    def __init__(self, input_shape=(224, 224, 3), num_classes=5):
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.model = self._build_model()
        
    def _build_model(self):
        """Build and return a CNN model for medical image classification"""
        model = Sequential([
            Conv2D(32, (3, 3), activation='relu', input_shape=self.input_shape),
            MaxPooling2D(2, 2),
            Conv2D(64, (3, 3), activation='relu'),
            MaxPooling2D(2, 2),
            Conv2D(128, (3, 3), activation='relu'),
            MaxPooling2D(2, 2),
            Flatten(),
            Dense(512, activation='relu'),
            Dropout(0.5),
            Dense(self.num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train(self, train_data, train_labels, validation_data=None, 
              validation_labels=None, epochs=10, batch_size=32):
        """Train the model on the given data"""
        history = self.model.fit(
            train_data, train_labels,
            validation_data=(validation_data, validation_labels) if validation_data is not None else None,
            epochs=epochs,
            batch_size=batch_size
        )
        return history
    
    def evaluate(self, test_data, test_labels):
        """Evaluate the model on test data"""
        return self.model.evaluate(test_data, test_labels)
    
    def predict(self, data):
        """Make predictions on new data"""
        return self.model.predict(data)
    
    def save(self, filepath):
        """Save the model to the given filepath"""
        self.model.save(filepath)
    
    @classmethod
    def load(cls, filepath):
        """Load a model from the given filepath"""
        instance = cls()
        instance.model = tf.keras.models.load_model(filepath)
        return instance 