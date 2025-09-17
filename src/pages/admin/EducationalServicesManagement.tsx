import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, School, Users, BookOpen, Building2, Settings } from 'lucide-react';
import SchoolCategoriesManagement from './SchoolCategoriesManagement';
import SchoolsManagement from './SchoolsManagement';

const EducationalServicesManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة الخدمات التعليمية</h1>
        <p className="text-muted-foreground">إدارة المدارس والخدمات التعليمية في المدينة</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <School className="h-4 w-4" />
            <span>فئات المدارس</span>
          </TabsTrigger>
          <TabsTrigger value="schools" className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4" />
            <span>المدارس</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <SchoolCategoriesManagement />
        </TabsContent>

        <TabsContent value="schools" className="space-y-6">
          <SchoolsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EducationalServicesManagement;