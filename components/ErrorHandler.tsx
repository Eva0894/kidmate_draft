import React, { useEffect } from 'react';
import { Alert, LogBox } from 'react-native';

// 忽略特定警告
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed',
  'EventEmitter.removeListener',
]);

// 全局未捕获错误处理器
export function setupGlobalErrorHandler() {
  useEffect(() => {
    // 处理未捕获的JS错误
    const errorHandler = (error: Error, isFatal: boolean) => {
      if (isFatal) {
        console.error('致命错误:', error);
        Alert.alert(
          '应用遇到问题',
          '应用发生错误，请尝试重启应用。\n\n' + error.message,
          [{ text: '确定' }]
        );
      } else {
        console.warn('非致命错误:', error);
      }
    };

    // 设置全局错误处理
    const originalErrorHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      errorHandler(error, isFatal);
      originalErrorHandler(error, isFatal);
    });

    // 捕获未处理的Promise rejection
    const rejectionTrackingHandler = (id: string, error: Error) => {
      console.warn('未处理的Promise拒绝:', error);
    };

    if (global.PromiseRejectionTracker) {
      const originalRejectionCallback = global.PromiseRejectionTracker;
      global.PromiseRejectionTracker = (id, error, promise) => {
        rejectionTrackingHandler(id, error);
        if (originalRejectionCallback) {
          originalRejectionCallback(id, error, promise);
        }
      };
    }

    return () => {
      // 恢复原始处理器
      ErrorUtils.setGlobalHandler(originalErrorHandler);
    };
  }, []);
  
  // 这个组件不会渲染任何内容
  return null;
}

export default setupGlobalErrorHandler; 