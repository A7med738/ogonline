import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, School, Users, BookOpen, Building2, Baby } from 'lucide-react';
import SchoolCategoriesManagement from './SchoolCategoriesManagement';
import SchoolsManagement from './SchoolsManagement';
import NurseriesManagement from './NurseriesManagement';
import EducationalCentersManagement from './EducationalCentersManagement';
import TeachersManagement from './TeachersManagement';
import UniversitiesManagement from './UniversitiesManagement';

const EducationalServicesManagement = () => {
  return (
    <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">إدارة الخدمات التعليمية</h1>
          </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <School className="h-4 w-4" />
            <span className="hidden sm:inline">فئات المدارس</span>
          </TabsTrigger>
          <TabsTrigger value="schools" className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">المدارس</span>
          </TabsTrigger>
          <TabsTrigger value="nurseries" className="flex items-center space-x-2">
            <Baby className="h-4 w-4" />
            <span className="hidden sm:inline">الحضانات</span>
          </TabsTrigger>
          <TabsTrigger value="centers" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">السناتر</span>
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">المدرسين</span>
          </TabsTrigger>
          <TabsTrigger value="universities" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">الجامعات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <SchoolCategoriesManagement />
        </TabsContent>

        <TabsContent value="schools" className="space-y-6">
          <SchoolsManagement />
        </TabsContent>

        <TabsContent value="nurseries" className="space-y-6">
          <NurseriesManagement />
        </TabsContent>

        <TabsContent value="centers" className="space-y-6">
          <EducationalCentersManagement />
        </TabsContent>

        <TabsContent value="teachers" className="space-y-6">
          <TeachersManagement />
        </TabsContent>

        <TabsContent value="universities" className="space-y-6">
          <UniversitiesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EducationalServicesManagement;